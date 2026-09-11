-- Supabase / Postgres schema, Final Green Light Blueprint

CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  start_date date,
  end_date date
);

CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id),
  user_id uuid, -- maps to Supabase Auth UID
  max_daily_budget numeric, -- used for Group Safe Limit
  pace_preference text CHECK (pace_preference IN ('pacesetter', 'spectator')),
  social_battery_hours numeric,
  telegram_chat_id text -- For the actual binding flow
);

-- Flat Fission UI schema replacing complex communal/rogue ledgers
CREATE TABLE itinerary_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id),
  event_time timestamptz,
  title text,
  location_name text,
  cost numeric DEFAULT 0,
  event_type text CHECK (event_type IN ('anchor_node', 'ghost_block')),
  assigned_users uuid[] -- array of user_ids assigned to this event
);

CREATE TABLE eject_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id),
  trip_id uuid REFERENCES trips(id),
  trigger_reason text,
  grab_cost_estimate numeric,
  triggered_at timestamptz DEFAULT now()
);
