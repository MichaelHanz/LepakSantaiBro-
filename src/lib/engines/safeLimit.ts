import type { GroupSafeLimit, Member } from '../../types';

/**
 * SPEC.md 2.1 — the aggregate uses MIN, never average: no shared activity may
 * exceed what the most constrained member can sustain.
 */
export function calculateGroupSafeLimit(members: Member[]): GroupSafeLimit {
  if (members.length === 0) {
    return { daily_budget_ceiling: 0, max_group_hours: 0 };
  }
  return {
    daily_budget_ceiling: Math.min(...members.map((m) => m.max_daily_budget)),
    max_group_hours: Math.min(...members.map((m) => m.social_battery_hours)),
  };
}
