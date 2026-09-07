import type {
  AnchorImpact,
  AnchorNode,
  EjectionRoute,
  GeoPoint,
  SanctuaryNode,
  ScoredSanctuaryNode,
} from '../../types';

/**
 * SPEC.md 2.4 — weighted nearest-node scoring (not A*).
 * Order: [travel_time_weight, budget_weight, distance_weight].
 * Kept tunable per the risk note in SPEC.md 6.
 */
export const DEFAULT_EJECT_WEIGHTS: readonly [number, number, number] = [0.4, 0.3, 0.3];

export interface Bounds {
  min: number;
  max: number;
}

export function boundsOf(values: number[]): Bounds {
  if (values.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}

/**
 * Min-max normalization onto [0, 1]. `inverse` flips the scale so that lower
 * raw values (cheaper, closer, faster) score higher.
 */
export function normalize(value: number, inverse: boolean, bounds: Bounds): number {
  const span = bounds.max - bounds.min;
  // A single distinct value carries no signal, so it neither helps nor penalises.
  if (span === 0) return 1;
  const scaled = (value - bounds.min) / span;
  return inverse ? 1 - scaled : scaled;
}

export function scoreSanctuaryNode(
  node: SanctuaryNode,
  bounds: { time: Bounds; cost: Bounds; distance: Bounds },
  weights: readonly [number, number, number],
): number {
  return (
    weights[0] * normalize(node.travel_time_minutes, true, bounds.time) +
    weights[1] * normalize(node.estimated_cost, true, bounds.cost) +
    weights[2] * normalize(node.distance_km, true, bounds.distance)
  );
}

export function fallbackCheapestOption(candidates: SanctuaryNode[]): SanctuaryNode | null {
  if (candidates.length === 0) return null;
  return candidates.reduce((cheapest, node) =>
    node.estimated_cost < cheapest.estimated_cost ? node : cheapest,
  );
}

/**
 * SPEC.md 2.4 — hard-filters candidates over the remaining budget, scores the
 * survivors, and never returns nothing while any candidate exists.
 * `userLocation` is accepted for parity with the spec signature; travel time and
 * distance are supplied per-candidate by the routing layer (OSRM).
 */
export function findEjectionRoute(
  userLocation: GeoPoint,
  candidates: SanctuaryNode[],
  remainingBudget: number,
  weights: readonly [number, number, number] = DEFAULT_EJECT_WEIGHTS,
): EjectionRoute | null {
  const affordable = candidates.filter((node) => node.estimated_cost <= remainingBudget);

  if (affordable.length === 0) {
    const cheapest = fallbackCheapestOption(candidates);
    if (!cheapest) return null;
    return {
      node: cheapest,
      score: 0,
      outcome: 'fallback_cheapest',
      considered: [],
      reason: 'no candidate fits the remaining budget — fell back to the cheapest option',
    };
  }

  const bounds = {
    time: boundsOf(affordable.map((n) => n.travel_time_minutes)),
    cost: boundsOf(affordable.map((n) => n.estimated_cost)),
    distance: boundsOf(affordable.map((n) => n.distance_km)),
  };

  const scored: ScoredSanctuaryNode[] = affordable.map((node) => ({
    node,
    score: scoreSanctuaryNode(node, bounds, weights),
  }));

  const best = scored.reduce((top, entry) => (entry.score > top.score ? entry : top));

  return {
    node: best.node,
    score: best.score,
    outcome: 'scored',
    considered: [...scored].sort((a, b) => b.score - a.score),
    reason: 'highest weighted score among candidates within the remaining budget',
  };
}

export interface EjectionRequest {
  memberId: string;
  userLocation: GeoPoint;
  remainingBudget: number;
}

export interface MemberEjectionRoute {
  memberId: string;
  route: EjectionRoute | null;
}

/**
 * SPEC.md 2.4 edge case: two members ejecting within the same ghost block are
 * routed independently — each keeps its own remaining budget and candidate set.
 */
export function findEjectionRoutes(
  requests: EjectionRequest[],
  candidates: SanctuaryNode[],
  weights: readonly [number, number, number] = DEFAULT_EJECT_WEIGHTS,
): MemberEjectionRoute[] {
  return requests.map((request) => ({
    memberId: request.memberId,
    route: findEjectionRoute(request.userLocation, candidates, request.remainingBudget, weights),
  }));
}

export function parseClockMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes ?? 0);
}

export function formatClockMinutes(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  const mins = Math.round(wrapped % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * SPEC.md 2.4 edge case: an eject near a mandatory anchor node must recompute
 * whether the member can still make it, and otherwise propose a new time.
 */
export function evaluateAnchorImpact(
  route: EjectionRoute,
  anchor: AnchorNode | null,
  nowMinutes: number,
  minimumSanctuaryStayMinutes = 30,
): AnchorImpact | null {
  if (!anchor) return null;

  const anchorMinutes = parseClockMinutes(anchor.time);
  const minutesUntilAnchor = anchorMinutes - nowMinutes;
  // Out to the sanctuary, a minimum decompression stay, then back to the anchor.
  const minutesNeeded =
    route.node.travel_time_minutes * 2 + minimumSanctuaryStayMinutes;
  const canMake = minutesUntilAnchor >= minutesNeeded;

  return {
    anchor,
    minutes_until_anchor: minutesUntilAnchor,
    minutes_needed: minutesNeeded,
    can_make_anchor: canMake,
    suggested_anchor_time: canMake ? null : formatClockMinutes(nowMinutes + minutesNeeded),
  };
}
