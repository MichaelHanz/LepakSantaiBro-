import type { CommunalExpenseResult, GroupSafeLimit, Ledger } from '../../types';

export const OVER_CEILING_REASON = "exceeds lowest member's budget ceiling";

export function createLedger(): Ledger {
  return { communal_burn_rate: 0, rogue_spend: {} };
}

export function communalBurnRatePerMember(ledger: Ledger, memberCount: number): number {
  if (memberCount <= 0) return 0;
  return ledger.communal_burn_rate / memberCount;
}

/**
 * SPEC.md 2.3 — guard clause on the shared ledger. Returns a new ledger rather
 * than mutating so the caller can keep React state immutable.
 */
export function proposeCommunalExpense(
  ledger: Ledger,
  amount: number,
  groupSafeLimit: GroupSafeLimit,
  memberCount: number,
): CommunalExpenseResult {
  const perMemberShare = memberCount > 0 ? amount / memberCount : amount;
  const projected = perMemberShare + communalBurnRatePerMember(ledger, memberCount);

  if (projected > groupSafeLimit.daily_budget_ceiling) {
    return {
      approved: false,
      reason: OVER_CEILING_REASON,
      amount,
      per_member_share: perMemberShare,
      ledger,
    };
  }

  return {
    approved: true,
    amount,
    per_member_share: perMemberShare,
    ledger: { ...ledger, communal_burn_rate: ledger.communal_burn_rate + amount },
  };
}

/** Rogue spend never touches the communal figure (SPEC.md 2.3). */
export function addRogueSpend(ledger: Ledger, memberId: string, amount: number): Ledger {
  return {
    ...ledger,
    rogue_spend: {
      ...ledger.rogue_spend,
      [memberId]: (ledger.rogue_spend[memberId] ?? 0) + amount,
    },
  };
}

export function totalRogueSpend(ledger: Ledger): number {
  return Object.values(ledger.rogue_spend).reduce((sum, value) => sum + value, 0);
}

/** Budget a member still has for the rest of the day, used by the eject engine. */
export function remainingBudgetFor(
  ledger: Ledger,
  memberId: string,
  memberCount: number,
  groupSafeLimit: GroupSafeLimit,
): number {
  const spent =
    communalBurnRatePerMember(ledger, memberCount) + (ledger.rogue_spend[memberId] ?? 0);
  return Math.max(0, groupSafeLimit.daily_budget_ceiling - spent);
}
