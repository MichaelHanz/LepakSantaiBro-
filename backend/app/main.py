"""FastAPI scaffold for the deterministic engines (SPEC.md 3).

Follow-up: the shipped client runs these engines locally in TypeScript with a
precomputed sanctuary pool. This service exists so the same math can move
server-side against Supabase without changing the client contract.
"""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel

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

# In-memory store; swap for Supabase (backend/schema.sql) when persistence lands.
LEDGERS: dict[str, Ledger] = {}


class ConstraintIn(BaseModel):
    user_id: str
    max_daily_budget: float
    pace_preference: str
    social_battery_hours: float


class SafeLimitIn(BaseModel):
    members: list[ConstraintIn]


class CommunalExpenseIn(BaseModel):
    trip_id: str
    amount: float
    member_count: int
    daily_budget_ceiling: float


class RogueSpendIn(BaseModel):
    trip_id: str
    member_id: str
    amount: float


class SanctuaryNodeIn(BaseModel):
    id: str
    name: str
    travel_time_minutes: float
    distance_km: float
    estimated_cost: float


class EjectIn(BaseModel):
    candidates: list[SanctuaryNodeIn]
    remaining_budget: float


def _ledger(trip_id: str) -> Ledger:
    return LEDGERS.setdefault(trip_id, Ledger())


@app.post("/safe-limit")
def safe_limit(payload: SafeLimitIn) -> dict[str, float]:
    return calculate_group_safe_limit([Constraint(**m.model_dump()) for m in payload.members])


@app.post("/ledger/communal")
def communal(payload: CommunalExpenseIn) -> dict[str, object]:
    ledger = _ledger(payload.trip_id)
    result = propose_communal_expense(
        ledger,
        payload.amount,
        {"daily_budget_ceiling": payload.daily_budget_ceiling},
        payload.member_count,
    )
    return {**result, "communal_burn_rate": ledger.communal_burn_rate}


@app.post("/ledger/rogue")
def rogue(payload: RogueSpendIn) -> dict[str, object]:
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
