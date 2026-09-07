export type PacePreference = 'pacesetter' | 'spectator';

/** SPEC.md 2.1 — privately submitted constraints. */
export interface Member {
  user_id: string;
  trip_id: string;
  max_daily_budget: number;
  pace_preference: PacePreference;
  social_battery_hours: number;
  /** Display-only metadata, never a constraint. */
  display_name: string;
  initials: string;
  color: string;
}

export interface Trip {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  city: string;
}

export interface GroupSafeLimit {
  daily_budget_ceiling: number;
  max_group_hours: number;
}

/** SPEC.md 2.2 */
export interface AnchorNode {
  time: string;
  activity: string;
  location: string;
  cost_per_member: number;
}

export interface GhostActivity {
  type: string;
  location: string;
  estimated_cost: number;
}

export interface GhostBlock {
  start: string;
  end: string;
  pacesetter_activity: GhostActivity;
  spectator_activity: GhostActivity;
}

export interface DayPlan {
  day: number;
  anchor_nodes: AnchorNode[];
  ghost_blocks: GhostBlock[];
}

/** SPEC.md 2.3 */
export interface Ledger {
  communal_burn_rate: number;
  rogue_spend: Record<string, number>;
}

export interface CommunalExpenseResult {
  approved: boolean;
  reason?: string;
  amount: number;
  per_member_share: number;
  ledger: Ledger;
}

/** SPEC.md 2.4 */
export interface SanctuaryNode {
  id: string;
  name: string;
  kind: 'hotel' | 'cafe' | 'library' | 'park';
  travel_time_minutes: number;
  distance_km: number;
  estimated_cost: number;
}

export interface ScoredSanctuaryNode {
  node: SanctuaryNode;
  score: number;
}

export type EjectionOutcome = 'scored' | 'fallback_cheapest';

export interface EjectionRoute {
  node: SanctuaryNode;
  score: number;
  outcome: EjectionOutcome;
  considered: ScoredSanctuaryNode[];
  reason: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface EjectEvent {
  id: string;
  member_id: string;
  trigger_reason: string;
  chosen_sanctuary_node: SanctuaryNode;
  triggered_at: string;
  /** SPEC.md 2.4 edge case: can the member still make the next anchor node? */
  anchor_impact: AnchorImpact | null;
}

export interface AnchorImpact {
  anchor: AnchorNode;
  minutes_until_anchor: number;
  minutes_needed: number;
  can_make_anchor: boolean;
  suggested_anchor_time: string | null;
}
