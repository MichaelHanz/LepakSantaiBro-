import type { GeoPoint, Member, SanctuaryNode, Trip } from '../types';
import type { ActivityPool } from '../lib/engines/itinerary';
import { colors } from '../theme';

export const DEMO_TRIP: Trip = {
  id: 'trip-kl-001',
  name: 'KL long weekend',
  start_date: '2025-09-13',
  end_date: '2025-09-15',
  city: 'Kuala Lumpur',
};

export const CURRENT_USER_ID = 'user-you';

export const DEMO_MEMBERS: Member[] = [
  {
    user_id: CURRENT_USER_ID,
    trip_id: DEMO_TRIP.id,
    max_daily_budget: 120,
    pace_preference: 'pacesetter',
    social_battery_hours: 5,
    display_name: 'You',
    initials: 'YS',
    color: colors.teal,
  },
  {
    user_id: 'user-aina',
    trip_id: DEMO_TRIP.id,
    max_daily_budget: 95,
    pace_preference: 'pacesetter',
    social_battery_hours: 4,
    display_name: 'Aina',
    initials: 'AR',
    color: '#8b77d7',
  },
  {
    user_id: 'user-ben',
    trip_id: DEMO_TRIP.id,
    max_daily_budget: 80,
    pace_preference: 'spectator',
    social_battery_hours: 3,
    display_name: 'Ben',
    initials: 'BL',
    color: colors.coral,
  },
  {
    user_id: 'user-chong',
    trip_id: DEMO_TRIP.id,
    max_daily_budget: 110,
    pace_preference: 'spectator',
    social_battery_hours: 6,
    display_name: 'Chong',
    initials: 'CT',
    color: '#d7a927',
  },
];

/** Precomputed tagged pool for the demo city — an accepted shortcut per SPEC.md 2.2. */
export const KL_ACTIVITY_POOL: ActivityPool = {
  anchors: [
    { time: '13:00', activity: 'Lunch', location: 'Village Park, Damansara', cost_per_member: 24 },
    { time: '20:00', activity: 'Dinner', location: 'Dewakan, KL', cost_per_member: 32 },
    { time: '23:00', activity: 'Late supper', location: 'Jalan Alor', cost_per_member: 18 },
  ],
  ghost_windows: [
    { start: '09:00', end: '12:30' },
    { start: '14:30', end: '19:00' },
  ],
  activities: [
    { pace: 'pacesetter', type: 'hiking', location: 'Bukit Gasing trail', estimated_cost: 0 },
    { pace: 'pacesetter', type: 'street art walk', location: 'Jalan Panggong', estimated_cost: 15 },
    { pace: 'spectator', type: 'cafe', location: 'Botanica+Co, Bangsar', estimated_cost: 22 },
    { pace: 'spectator', type: 'library reset', location: 'Kuala Lumpur Library', estimated_cost: 0 },
  ],
};

export const DEMO_USER_LOCATION: GeoPoint = { latitude: 3.1421, longitude: 101.6968 };

/**
 * Sanctuary nodes with travel time / distance as returned by OSRM for the demo
 * city; kept static so the demo runs offline.
 */
export const KL_SANCTUARY_NODES: SanctuaryNode[] = [
  {
    id: 'zhongshan',
    name: 'The Zhongshan Building',
    kind: 'cafe',
    travel_time_minutes: 8,
    distance_km: 0.6,
    estimated_cost: 0,
  },
  {
    id: 'kl-library',
    name: 'Kuala Lumpur Library',
    kind: 'library',
    travel_time_minutes: 14,
    distance_km: 1.4,
    estimated_cost: 0,
  },
  {
    id: 'perdana-gardens',
    name: 'Perdana Botanical Gardens',
    kind: 'park',
    travel_time_minutes: 22,
    distance_km: 3.1,
    estimated_cost: 4,
  },
  {
    id: 'mercu-hotel',
    name: 'Mercu Lounge & Day Room',
    kind: 'hotel',
    travel_time_minutes: 11,
    distance_km: 1.1,
    estimated_cost: 65,
  },
];
