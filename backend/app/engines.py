"""Deterministic engines, mirroring src/lib/engines/*.ts (SPEC.md sections 2.1-2.4)."""

from __future__ import annotations

from dataclasses import dataclass, field

EJECT_WEIGHTS: tuple[float, float, float] = (0.4, 0.3, 0.3)
OVER_CEILING_REASON = "exceeds lowest member's budget ceiling"


@dataclass
class Constraint:
    user_id: str
    max_daily_budget: float
    pace_preference: str
    social_battery_hours: float


@dataclass
class SanctuaryNode:
    id: str
    name: str
    travel_time_minutes: float
    distance_km: float
    estimated_cost: float


@dataclass
class Ledger:
    communal_burn_rate: float = 0.0
    rogue_spend: dict[str, float] = field(default_factory=dict)


def calculate_group_safe_limit(members: list[Constraint]) -> dict[str, float]:
    if not members:
        return {"daily_budget_ceiling": 0.0, "max_group_hours": 0.0}
    return {
        "daily_budget_ceiling": min(m.max_daily_budget for m in members),
        "max_group_hours": min(m.social_battery_hours for m in members),
    }


def propose_communal_expense(
    ledger: Ledger, amount: float, group_safe_limit: dict[str, float], member_count: int
) -> dict[str, object]:
    per_member_share = amount / member_count if member_count else amount
    burn_per_member = ledger.communal_burn_rate / member_count if member_count else 0.0
    if per_member_share + burn_per_member > group_safe_limit["daily_budget_ceiling"]:
        return {"approved": False, "reason": OVER_CEILING_REASON}
    ledger.communal_burn_rate += amount
    return {"approved": True, "per_member_share": per_member_share}


def add_rogue_spend(ledger: Ledger, member_id: str, amount: float) -> Ledger:
    ledger.rogue_spend[member_id] = ledger.rogue_spend.get(member_id, 0.0) + amount
    return ledger


def normalize(value: float, inverse: bool, low: float, high: float) -> float:
    span = high - low
    if span == 0:
        return 1.0
    scaled = (value - low) / span
    return 1.0 - scaled if inverse else scaled


def fallback_cheapest_option(candidates: list[SanctuaryNode]) -> SanctuaryNode | None:
    return min(candidates, key=lambda node: node.estimated_cost, default=None)


def find_ejection_route(
    candidates: list[SanctuaryNode],
    remaining_budget: float,
    weights: tuple[float, float, float] = EJECT_WEIGHTS,
) -> dict[str, object] | None:
    affordable = [n for n in candidates if n.estimated_cost <= remaining_budget]
    if not affordable:
        cheapest = fallback_cheapest_option(candidates)
        if cheapest is None:
            return None
        return {"node": cheapest, "score": 0.0, "outcome": "fallback_cheapest"}

    times = [n.travel_time_minutes for n in affordable]
    costs = [n.estimated_cost for n in affordable]
    distances = [n.distance_km for n in affordable]

    scored = [
        (
            node,
            weights[0] * normalize(node.travel_time_minutes, True, min(times), max(times))
            + weights[1] * normalize(node.estimated_cost, True, min(costs), max(costs))
            + weights[2] * normalize(node.distance_km, True, min(distances), max(distances)),
        )
        for node in affordable
    ]
    node, score = max(scored, key=lambda pair: pair[1])
    return {"node": node, "score": score, "outcome": "scored"}
