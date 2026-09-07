import { buildDayPlan, groupHoursForAnchors, nextAnchorNode, splitGhostBlocks } from '../itinerary';
import type { ActivityPool } from '../itinerary';
import type { GroupSafeLimit, Member } from '../../../types';

const pool: ActivityPool = {
  anchors: [
    { time: '20:00', activity: 'Dinner', location: 'Dewakan', cost_per_member: 32 },
    { time: '13:00', activity: 'Lunch', location: 'Village Park', cost_per_member: 24 },
    { time: '23:00', activity: 'Supper', location: 'Jalan Alor', cost_per_member: 18 },
  ],
  ghost_windows: [{ start: '09:00', end: '12:30' }],
  activities: [
    { pace: 'pacesetter', type: 'hiking', location: 'Bukit Gasing', estimated_cost: 0 },
    { pace: 'spectator', type: 'cafe', location: 'Botanica', estimated_cost: 22 },
  ],
};

function member(id: string, pace: Member['pace_preference']): Member {
  return {
    user_id: id,
    trip_id: 't',
    max_daily_budget: 100,
    pace_preference: pace,
    social_battery_hours: 4,
    display_name: id,
    initials: id.slice(0, 2).toUpperCase(),
    color: '#000',
  };
}

const safeLimit: GroupSafeLimit = { daily_budget_ceiling: 80, max_group_hours: 3 };

describe('buildDayPlan', () => {
  it('sorts anchors and trims them to the group max_group_hours', () => {
    const plan = buildDayPlan(1, pool, safeLimit);

    expect(plan.anchor_nodes.map((a) => a.time)).toEqual(['13:00', '20:00']);
  });

  it('ghosts the whole day when the battery cannot cover a single anchor', () => {
    const plan = buildDayPlan(1, pool, { daily_budget_ceiling: 80, max_group_hours: 0.5 });

    expect(plan.anchor_nodes).toHaveLength(0);
    expect(plan.ghost_blocks).toHaveLength(1);
  });

  it('never schedules more mandatory shared hours than the group limit', () => {
    for (const max_group_hours of [0, 0.5, 1.5, 3, 4.5, 6]) {
      const plan = buildDayPlan(1, pool, { daily_budget_ceiling: 80, max_group_hours });

      expect(groupHoursForAnchors(plan.anchor_nodes)).toBeLessThanOrEqual(max_group_hours);
    }
  });

  it('splits ghost blocks by pace preference', () => {
    const plan = buildDayPlan(1, pool, safeLimit);
    const splits = splitGhostBlocks(plan, [member('aina', 'pacesetter'), member('ben', 'spectator')]);

    expect(splits[0].pacesetters.map((m) => m.user_id)).toEqual(['aina']);
    expect(splits[0].spectators.map((m) => m.user_id)).toEqual(['ben']);
    expect(splits[0].block.pacesetter_activity.type).toBe('hiking');
    expect(splits[0].block.spectator_activity.type).toBe('cafe');
  });
});

describe('nextAnchorNode', () => {
  it('returns the next fusion point after the given time', () => {
    const plan = buildDayPlan(1, pool, safeLimit);

    expect(nextAnchorNode(plan, 14 * 60)?.time).toBe('20:00');
    expect(nextAnchorNode(plan, 21 * 60)).toBeNull();
  });
});
