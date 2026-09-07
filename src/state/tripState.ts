import type { DayPlan, EjectEvent, Ledger, Member, Trip } from '../types';
import { createLedger } from '../lib/engines/ledger';
import { buildDayPlan } from '../lib/engines/itinerary';
import { calculateGroupSafeLimit } from '../lib/engines/safeLimit';
import { CURRENT_USER_ID, DEMO_MEMBERS, DEMO_TRIP, KL_ACTIVITY_POOL } from '../data/demo';

export interface TripState {
  trip: Trip;
  members: Member[];
  ledger: Ledger;
  plan: DayPlan;
  eject_events: EjectEvent[];
  current_user_id: string;
  /** Members who have privately submitted their constraints (SPEC.md 2.1). */
  submitted_member_ids: string[];
}

export function createInitialState(): TripState {
  const members = DEMO_MEMBERS;
  return {
    trip: DEMO_TRIP,
    members,
    ledger: createLedger(),
    plan: buildDayPlan(1, KL_ACTIVITY_POOL, calculateGroupSafeLimit(members)),
    eject_events: [],
    current_user_id: CURRENT_USER_ID,
    submitted_member_ids: members.map((m) => m.user_id),
  };
}

export function findMember(state: TripState, query: string): Member | null {
  const needle = query.trim().toLowerCase();
  if (!needle) return null;
  return (
    state.members.find((m) => m.user_id.toLowerCase() === needle) ??
    state.members.find((m) => m.display_name.toLowerCase() === needle) ??
    state.members.find((m) => m.display_name.toLowerCase().startsWith(needle)) ??
    null
  );
}

export function currentMember(state: TripState): Member {
  return (
    state.members.find((m) => m.user_id === state.current_user_id) ?? state.members[0]
  );
}
