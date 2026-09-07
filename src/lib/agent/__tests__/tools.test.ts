import { runTool } from '../tools';
import { createInitialState } from '../../../state/tripState';
import type { Intent } from '../types';

const intent = (partial: Partial<Intent> & Pick<Intent, 'tool'>): Intent => ({
  args: {},
  confidence: 1,
  ...partial,
});

describe('member resolution', () => {
  it('never charges the requester when an explicit name is unknown', () => {
    const state = createInitialState();

    const outcome = runTool(
      state,
      intent({ tool: 'add_rogue_spend', args: { amount: 40, member: 'Ainaa' } }),
    );

    expect(outcome.state.ledger).toBe(state.ledger);
    expect(outcome.facts).toContain('unknown_member=Ainaa');
  });

  it('does not reroute the requester when an eject target is unknown', () => {
    const state = createInitialState();

    const outcome = runTool(
      state,
      intent({ tool: 'find_ejection_route', args: { member: 'nobody-here' } }),
    );

    expect(outcome.state.eject_events).toHaveLength(0);
    expect(outcome.facts).toContain('unknown_member=nobody-here');
  });

  it('still resolves "me" to the current traveller', () => {
    const state = createInitialState();

    const outcome = runTool(state, intent({ tool: 'add_rogue_spend', args: { amount: 40, member: 'me' } }));

    expect(outcome.state.ledger.rogue_spend[state.current_user_id]).toBe(40);
  });
});

describe('set_my_constraints', () => {
  it('rejects non-positive values instead of making them the group floor', () => {
    const state = createInitialState();

    const outcome = runTool(
      state,
      intent({ tool: 'set_my_constraints', args: { max_daily_budget: 0 } }),
    );

    expect(outcome.state.members).toBe(state.members);
    expect(outcome.facts).toContain('invalid_constraint=true');
  });

  it('applies valid values privately', () => {
    const state = createInitialState();

    const outcome = runTool(
      state,
      intent({ tool: 'set_my_constraints', args: { max_daily_budget: 45 } }),
    );

    expect(outcome.facts).toContain('new_ceiling=45');
  });
});

describe('plan_day', () => {
  it('plans the next day for "tomorrow" without advancing the active plan', () => {
    const state = createInitialState();

    const outcome = runTool(state, intent({ tool: 'plan_day', args: { day: 'tomorrow' } }));

    expect(outcome.facts).toContain(`day=${state.plan.day + 1}`);
    expect(outcome.state.plan.day).toBe(state.plan.day);
  });

  it('keeps the current day when no day is requested', () => {
    const state = createInitialState();

    const outcome = runTool(state, intent({ tool: 'plan_day' }));

    expect(outcome.facts).toContain(`day=${state.plan.day}`);
    expect(outcome.state.plan.day).toBe(state.plan.day);
  });
});
