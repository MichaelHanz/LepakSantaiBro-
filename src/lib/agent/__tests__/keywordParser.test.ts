import { parseIntentWithKeywords } from '../keywordParser';

describe('parseIntentWithKeywords', () => {
  it('marks tomorrow requests so the planner does not return today', () => {
    expect(parseIntentWithKeywords("plan tomorrow's ghost blocks")).toMatchObject({
      tool: 'plan_day',
      args: { day: 'tomorrow' },
    });
    expect(parseIntentWithKeywords('plan the day')).toMatchObject({
      tool: 'plan_day',
      args: { day: undefined },
    });
  });

  it('attributes a named rogue spend to that member', () => {
    expect(parseIntentWithKeywords('log RM 20 rogue spend for Aina')).toMatchObject({
      tool: 'add_rogue_spend',
      args: { amount: 20, member: 'Aina' },
    });
  });

  it('keeps a lowercase "for <thing>" as a description, not a member', () => {
    expect(parseIntentWithKeywords('log RM 20 rogue spend for coffee')).toMatchObject({
      tool: 'add_rogue_spend',
      args: { amount: 20, member: 'me' },
    });
  });
});
