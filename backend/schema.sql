-- Supabase / Postgres schema, SPEC.md section 4.

CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  start_date date,
  end_date date
);

CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id),
  user_id uuid,
  max_daily_budget numeric,
  pace_preference text CHECK (pace_preference IN ('pacesetter', 'spectator')),
  social_battery_hours numeric
);

CREATE TABLE ledger_communal (
  trip_id uuid REFERENCES trips(id),
  day date,
  amount numeric,
  description text
);

CREATE TABLE ledger_rogue (
  member_id uuid REFERENCES members(id),
  day date,
  amount numeric,
  description text
);

CREATE TABLE eject_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id),
  trigger_reason text,
  chosen_sanctuary_node jsonb,
  triggered_at timestamptz DEFAULT now()
);
