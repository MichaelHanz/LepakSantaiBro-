"""FastAPI scaffold for the deterministic engines (SPEC.md 3).

Follow-up: the shipped client runs these engines locally in TypeScript with a
precomputed sanctuary pool. This service exists so the same math can move
server-side against Supabase without changing the client contract.
"""

from __future__ import annotations

import os
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, Header, HTTPException, status
from pydantic import BaseModel, Field

from .engines import (
    Constraint,
    Ledger,
    SanctuaryNode,
    add_rogue_spend,
    calculate_group_safe_limit,
    find_ejection_route,
    propose_communal_expense,
)

app = FastAPI(title="Group Trip Mediator")

# In-memory stores; swap for Supabase (backend/schema.sql) when persistence lands.
LEDGERS: dict[str, Ledger] = {}
# trip_id -> member user_ids allowed to move that trip's money.
MEMBERSHIPS: dict[str, set[str]] = {}

API_TOKEN = os.environ.get("MEDIATOR_API_TOKEN")

PositiveFloat = Annotated[float, Field(gt=0, allow_inf_nan=False)]
NonNegativeFloat = Annotated[float, Field(ge=0, allow_inf_nan=False)]


class Caller(BaseModel):
    user_id: str


def require_caller(
    authorization: Annotated[str | None, Header()] = None,
    x_user_id: Annotated[str | None, Header()] = None,
) -> Caller:
    """Bearer token plus caller identity; a ledger write is never anonymous."""
    if not API_TOKEN:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "MEDIATOR_API_TOKEN is not configured",
        )
    expected = f"Bearer {API_TOKEN}"
    if authorization != expected or not x_user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid credentials")
    return Caller(user_id=x_user_id)


def require_trip_member(trip_id: str, caller: Caller) -> None:
    if caller.user_id not in MEMBERSHIPS.get(trip_id, set()):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "caller is not a member of this trip")


class ConstraintIn(BaseModel):
    user_id: str = Field(min_length=1)
    max_daily_budget: PositiveFloat
    pace_preference: Literal["pacesetter", "spectator"]
    social_battery_hours: PositiveFloat


class SafeLimitIn(BaseModel):
    members: list[ConstraintIn] = Field(min_length=1, max_length=50)


class CommunalExpenseIn(BaseModel):
    trip_id: str = Field(min_length=1)
    amount: PositiveFloat
    member_count: int = Field(gt=0, le=50)
    daily_budget_ceiling: PositiveFloat


class RogueSpendIn(BaseModel):
    trip_id: str = Field(min_length=1)
    member_id: str = Field(min_length=1)
    amount: PositiveFloat


class SanctuaryNodeIn(BaseModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1, max_length=200)
    travel_time_minutes: NonNegativeFloat
    distance_km: NonNegativeFloat
    estimated_cost: NonNegativeFloat


class EjectIn(BaseModel):
    candidates: list[SanctuaryNodeIn] = Field(min_length=1, max_length=200)
    remaining_budget: NonNegativeFloat


def _ledger(trip_id: str) -> Ledger:
    return LEDGERS.setdefault(trip_id, Ledger())


@app.post("/safe-limit")
def safe_limit(payload: SafeLimitIn) -> dict[str, float]:
    return calculate_group_safe_limit([Constraint(**m.model_dump()) for m in payload.members])


class MembershipIn(BaseModel):
    trip_id: str = Field(min_length=1)
    member_ids: list[str] = Field(min_length=1, max_length=50)


@app.post("/trips/members")
def register_members(
    payload: MembershipIn,
    caller: Annotated[Caller, Depends(require_caller)],
) -> dict[str, object]:
    """The first authenticated caller bootstraps a trip; after that only its members may extend it."""
    members = MEMBERSHIPS.setdefault(payload.trip_id, set())
    if members and caller.user_id not in members:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "caller is not a member of this trip")
    members.update(payload.member_ids)
    members.add(caller.user_id)
    return {"trip_id": payload.trip_id, "members": sorted(members)}


@app.post("/ledger/communal")
def communal(
    payload: CommunalExpenseIn,
    caller: Annotated[Caller, Depends(require_caller)],
) -> dict[str, object]:
    require_trip_member(payload.trip_id, caller)
    ledger = _ledger(payload.trip_id)
    result = propose_communal_expense(
        ledger,
        payload.amount,
        {"daily_budget_ceiling": payload.daily_budget_ceiling},
        payload.member_count,
    )
    return {**result, "communal_burn_rate": ledger.communal_burn_rate}


@app.post("/ledger/rogue")
def rogue(
    payload: RogueSpendIn,
    caller: Annotated[Caller, Depends(require_caller)],
) -> dict[str, object]:
    require_trip_member(payload.trip_id, caller)
    # Rogue spend is personal: only its owner may log it.
    if payload.member_id != caller.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "cannot log rogue spend for another member")
    ledger = add_rogue_spend(_ledger(payload.trip_id), payload.member_id, payload.amount)
    return {
        "rogue_spend": ledger.rogue_spend,
        "communal_burn_rate": ledger.communal_burn_rate,
    }


@app.post("/eject")
def eject(payload: EjectIn) -> dict[str, object] | None:
    candidates = [SanctuaryNode(**node.model_dump()) for node in payload.candidates]
    result = find_ejection_route(candidates, payload.remaining_budget)
    if result is None:
        return None
    node = result["node"]
    return {"node": node.__dict__, "score": result["score"], "outcome": result["outcome"]}
