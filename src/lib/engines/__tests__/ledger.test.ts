import {
  OVER_CEILING_REASON,
  addRogueSpend,
  createLedger,
  proposeCommunalExpense,
  remainingBudgetFor,
  totalRogueSpend,
} from '../ledger';
import type { GroupSafeLimit } from '../../../types';

const safeLimit: GroupSafeLimit = { daily_budget_ceiling: 80, max_group_hours: 3 };

describe('proposeCommunalExpense', () => {
  it('divides by member_count rather than a hardcoded group size', () => {
    const result = proposeCommunalExpense(createLedger(), 100, safeLimit, 5);

    expect(result.approved).toBe(true);
    expect(result.per_member_share).toBe(20);
    expect(result.ledger.communal_burn_rate).toBe(100);
  });

  it("blocks an expense that pushes a member past the lowest member's ceiling", () => {
    const ledger = proposeCommunalExpense(createLedger(), 240, safeLimit, 4).ledger;
    const result = proposeCommunalExpense(ledger, 120, safeLimit, 4);

    expect(result.approved).toBe(false);
    expect(result.reason).toBe(OVER_CEILING_REASON);
    expect(result.ledger.communal_burn_rate).toBe(240);
  });

  it('approves an expense that lands exactly on the ceiling', () => {
    const result = proposeCommunalExpense(createLedger(), 320, safeLimit, 4);

    expect(result.approved).toBe(true);
    expect(result.per_member_share).toBe(80);
  });
});

describe('addRogueSpend', () => {
  it('never touches the communal figure', () => {
    const seeded = proposeCommunalExpense(createLedger(), 40, safeLimit, 4).ledger;
    const ledger = addRogueSpend(addRogueSpend(seeded, 'aina', 30), 'ben', 12);

    expect(ledger.communal_burn_rate).toBe(40);
    expect(ledger.rogue_spend).toEqual({ aina: 30, ben: 12 });
    expect(totalRogueSpend(ledger)).toBe(42);
  });
});

describe('remainingBudgetFor', () => {
  it('subtracts the member share of communal burn plus their own rogue spend', () => {
    const ledger = addRogueSpend(
      proposeCommunalExpense(createLedger(), 80, safeLimit, 4).ledger,
      'aina',
      25,
    );

    expect(remainingBudgetFor(ledger, 'aina', 4, safeLimit)).toBe(35);
    expect(remainingBudgetFor(ledger, 'ben', 4, safeLimit)).toBe(60);
  });

  it('never goes negative', () => {
    const ledger = addRogueSpend(createLedger(), 'aina', 500);

    expect(remainingBudgetFor(ledger, 'aina', 4, safeLimit)).toBe(0);
  });
});
