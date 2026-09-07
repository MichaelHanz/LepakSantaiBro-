import { calculateGroupSafeLimit } from '../safeLimit';
import type { Member } from '../../../types';

function member(overrides: Partial<Member>): Member {
  return {
    user_id: 'u',
    trip_id: 't',
    max_daily_budget: 100,
    pace_preference: 'pacesetter',
    social_battery_hours: 5,
    display_name: 'Someone',
    initials: 'SO',
    color: '#000',
    ...overrides,
  };
}

describe('calculateGroupSafeLimit', () => {
  it('uses the minimum budget and minimum battery, not the average', () => {
    const members = [
      member({ user_id: 'a', max_daily_budget: 120, social_battery_hours: 5 }),
      member({ user_id: 'b', max_daily_budget: 80, social_battery_hours: 6 }),
      member({ user_id: 'c', max_daily_budget: 110, social_battery_hours: 3 }),
    ];

    expect(calculateGroupSafeLimit(members)).toEqual({
      daily_budget_ceiling: 80,
      max_group_hours: 3,
    });
  });

  it('returns zeroes for an empty group', () => {
    expect(calculateGroupSafeLimit([])).toEqual({ daily_budget_ceiling: 0, max_group_hours: 0 });
  });
});
