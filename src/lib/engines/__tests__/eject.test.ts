import {
  DEFAULT_EJECT_WEIGHTS,
  evaluateAnchorImpact,
  fallbackCheapestOption,
  findEjectionRoute,
  findEjectionRoutes,
  normalize,
} from '../eject';
import type { AnchorNode, GeoPoint, SanctuaryNode } from '../../../types';

const location: GeoPoint = { latitude: 3.14, longitude: 101.69 };

const candidates: SanctuaryNode[] = [
  {
    id: 'cheap-far',
    name: 'Far Library',
    kind: 'library',
    travel_time_minutes: 30,
    distance_km: 5,
    estimated_cost: 0,
  },
  {
    id: 'close-cheap',
    name: 'Corner Cafe',
    kind: 'cafe',
    travel_time_minutes: 8,
    distance_km: 0.6,
    estimated_cost: 5,
  },
  {
    id: 'expensive',
    name: 'Day Room Hotel',
    kind: 'hotel',
    travel_time_minutes: 6,
    distance_km: 0.4,
    estimated_cost: 200,
  },
];

describe('normalize', () => {
  it('inverts so that lower raw values score higher', () => {
    const bounds = { min: 0, max: 10 };

    expect(normalize(0, true, bounds)).toBe(1);
    expect(normalize(10, true, bounds)).toBe(0);
    expect(normalize(10, false, bounds)).toBe(1);
  });

  it('treats a zero-width range as a perfect score', () => {
    expect(normalize(7, true, { min: 7, max: 7 })).toBe(1);
  });
});

describe('findEjectionRoute', () => {
  it('hard-filters candidates over the remaining budget', () => {
    const route = findEjectionRoute(location, candidates, 50);

    expect(route?.outcome).toBe('scored');
    expect(route?.considered.map((entry) => entry.node.id)).not.toContain('expensive');
  });

  it('picks the highest weighted score among affordable candidates', () => {
    const route = findEjectionRoute(location, candidates, 50);

    expect(route?.node.id).toBe('close-cheap');
    expect(route?.score).toBeGreaterThan(0);
  });

  it('falls back to the cheapest option when nothing fits the budget', () => {
    const route = findEjectionRoute(location, candidates, -1);

    expect(route?.outcome).toBe('fallback_cheapest');
    expect(route?.node.id).toBe('cheap-far');
  });

  it('returns null only when there are no candidates at all', () => {
    expect(findEjectionRoute(location, [], 100)).toBeNull();
    expect(fallbackCheapestOption([])).toBeNull();
  });

  it('respects tuned weights', () => {
    const timeHeavy = findEjectionRoute(location, candidates, 50, [1, 0, 0]);
    const costHeavy = findEjectionRoute(location, candidates, 50, [0, 1, 0]);

    expect(timeHeavy?.node.id).toBe('close-cheap');
    expect(costHeavy?.node.id).toBe('cheap-far');
    expect(DEFAULT_EJECT_WEIGHTS).toEqual([0.4, 0.3, 0.3]);
  });
});

describe('findEjectionRoutes', () => {
  it('routes two members in the same ghost block independently', () => {
    const routes = findEjectionRoutes(
      [
        { memberId: 'aina', userLocation: location, remainingBudget: 50 },
        { memberId: 'ben', userLocation: location, remainingBudget: 2 },
      ],
      candidates,
    );

    expect(routes[0].route?.node.id).toBe('close-cheap');
    expect(routes[1].route?.node.id).toBe('cheap-far');
    expect(routes[1].route?.outcome).toBe('scored');
  });
});

describe('evaluateAnchorImpact', () => {
  const anchor: AnchorNode = {
    time: '20:00',
    activity: 'Dinner',
    location: 'Dewakan',
    cost_per_member: 32,
  };

  it('confirms the member can still make a distant anchor', () => {
    const route = findEjectionRoute(location, candidates, 50);
    const impact = evaluateAnchorImpact(route!, anchor, 17 * 60);

    expect(impact?.can_make_anchor).toBe(true);
    expect(impact?.suggested_anchor_time).toBeNull();
  });

  it('suggests a new anchor time when the eject overruns it', () => {
    const route = findEjectionRoute(location, candidates, 50);
    const impact = evaluateAnchorImpact(route!, anchor, 19 * 60 + 40);

    expect(impact?.can_make_anchor).toBe(false);
    expect(impact?.suggested_anchor_time).toBe('20:26');
  });

  it('returns null when there is no upcoming anchor', () => {
    const route = findEjectionRoute(location, candidates, 50);

    expect(evaluateAnchorImpact(route!, null, 600)).toBeNull();
  });
});
