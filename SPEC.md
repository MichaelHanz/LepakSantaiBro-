# Group Trip Mediator
### A ruthless social and financial mediator for group travel — not another AI itinerary generator

> **Note for AI coding agents (Antigravity / Cursor):** this document is the build spec. Follow the data models and algorithms exactly as specified — they are deliberately concrete, not illustrative. Where a section says "pseudocode," treat it as the intended logic, not a suggestion to redesign.

---

## 1. What this app is and isn't

**It is not** an AI trip-itinerary generator. That category is saturated and not the differentiator.

**It is** a mediator that removes forced consensus from group trips by:
- Collecting hard personal constraints privately, before anyone has to negotiate out loud
- Structurally splitting the group during low-stakes hours instead of forcing everyone into the same activity
- Tracking shared and personal spending on separate ledgers so one person's overspending can't silently drain another's budget
- Providing a one-tap "Eject" mechanism that removes a struggling member from an activity and reroutes them without requiring group debate

The headline demo moment is **Eject**, not the itinerary — lead the pitch with that.

---

## 2. Feature architecture

### 2.1 Blind threshold onboarding

Each traveler privately submits, before the trip:

```json
{
  "user_id": "uuid",
  "trip_id": "uuid",
  "max_daily_budget": 120.00,
  "pace_preference": "pacesetter" | "spectator",
  "social_battery_hours": 5
}
```

The system aggregates these into a hidden **Group Safe Limit** — never shown to individuals, used only by the ledger and itinerary engines:

```python
def calculate_group_safe_limit(members: list[Constraint]) -> dict:
    return {
        "daily_budget_ceiling": min(m.max_daily_budget for m in members),
        "max_group_hours": min(m.social_battery_hours for m in members),
    }
```

The minimum, not the average, is load-bearing here — the point is that no proposed shared activity is allowed to exceed what the most constrained member can sustain.

### 2.2 Fission & fusion itinerary

Each day has 2-3 mandatory **Anchor Nodes** (e.g. shared lunch at 1:00 PM, dinner at 8:00 PM) and **Ghost Blocks** in between, where the group is deliberately split by `pace_preference`:

```json
{
  "day": 1,
  "anchor_nodes": [
    {"time": "13:00", "activity": "Lunch", "location": "..."},
    {"time": "20:00", "activity": "Dinner", "location": "..."}
  ],
  "ghost_blocks": [
    {
      "start": "09:00", "end": "12:30",
      "pacesetter_activity": {"type": "hiking", "location": "..."},
      "spectator_activity": {"type": "cafe", "location": "..."}
    }
  ]
}
```

Activity candidates for ghost blocks come from geocoded points of interest tagged by pace intensity (see tech stack, section 3, for the free geocoding source). For the hackathon build, a precomputed tagged activity list for the demo city is an acceptable shortcut over a fully general recommendation engine.

### 2.3 Asymmetrical ledger

Two independent running totals per trip:

```python
class Ledger:
    communal_burn_rate: float   # shared expenses: rides, lodging
    rogue_spend: dict[str, float]  # per-user personal spending during ghost blocks

def propose_communal_expense(ledger, amount, group_safe_limit, member_count):
    per_member_share = amount / member_count
    if per_member_share + ledger.communal_burn_rate_per_member > group_safe_limit["daily_budget_ceiling"]:
        return {"approved": False, "reason": "exceeds lowest member's budget ceiling"}
    ledger.communal_burn_rate += amount
    return {"approved": True}
```

Rogue spend deducts only from the individual's personal total and never touches the communal figure. This is the simplest component to build — pure CRUD and a guard clause, no ML required.

### 2.4 Eject engine (dynamic rerouting)

**Naming correction from the original pitch:** this is a **weighted multi-criteria scoring algorithm**, not classic A* pathfinding. A* solves shortest-path-through-a-graph problems; this is ranking a small set of candidate destinations. Call it "weighted nearest-node scoring" — it holds up under technical questioning, and it's what actually gets built in the available time.

```python
def find_ejection_route(user_location, candidates, remaining_budget, weights=(0.4, 0.3, 0.3)):
    """
    candidates: list of sanctuary nodes (hotels, cafes, libraries) with
                travel_time_minutes, distance_km, estimated_cost
    weights: (travel_time_weight, budget_weight, distance_weight)
    """
    scored = []
    for node in candidates:
        if node.estimated_cost > remaining_budget:
            continue  # hard filter, not just a scoring penalty
        score = (
            weights[0] * normalize(node.travel_time_minutes, inverse=True) +
            weights[1] * normalize(node.estimated_cost, inverse=True) +
            weights[2] * normalize(node.distance_km, inverse=True)
        )
        scored.append((node, score))
    if not scored:
        return fallback_cheapest_option(candidates)  # required edge case handling
    return max(scored, key=lambda pair: pair[1])[0]
```

Travel time and distance come from a routing API (see tech stack). On ejection, the group's itinerary is patched with a new fusion point where the ejected member rejoins, and the ledger is recalculated for the remainder of the day.

**Edge cases the agent building this must handle:**
- No candidate fits the remaining budget → fall back to the cheapest available option regardless of score, never return nothing
- Two members eject within the same ghost block → process independently unless they explicitly request to be routed together
- Eject triggered near a mandatory Anchor Node → recalculate whether the ejected member can still make it, and if not, notify the group to adjust the Anchor Node time

---

## 3. Tech stack (zero-cost, no credit card required)

| Layer | Choice | Why |
|---|---|---|
| Mobile client | React Native + Expo, **custom dev client** (not plain Expo Go) | Cross-platform; a dev client is required once native modules (below) are added |
| Backend | FastAPI (Python) | Hosts the ledger logic, onboarding aggregation, and eject scoring |
| LLM | Google Gemini (free tier) primary, Groq as fallback | No card required; used for ghost-block activity suggestions and narration, not for the ledger or eject math (those stay deterministic) |
| Geocoding | OpenStreetMap Nominatim | Free, keyless — converts place names to coordinates |
| Routing / travel time | OSRM (Open Source Routing Machine) | Free public routing server, no key, no card — avoids Google Maps Platform billing entirely |
| Database + Auth | Supabase (Postgres) | Free tier; handles auth, trip data, and realtime ledger updates |
| Scheduling | APScheduler (in-process, FastAPI) | Not required for MVP unless adding weather-triggered auto-eject |
| Hosting | Render (free web service tier) | No idle cost |
| Push notifications | Expo push service | Free; used for group notifications after a reroute |

**Important cost note:** do not substitute Google Directions/Places APIs for routing or geocoding — they require a billing account on file, unlike everything else in this stack.

---

## 4. Data model (Postgres / Supabase)

```sql
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
```

---

## 5. Build priority (hackathon scope)

1. **Asymmetrical ledger** — no dependencies, highest demo-to-effort ratio
2. **Blind threshold onboarding** — feeds the ledger and the eject scoring
3. **Eject engine (weighted scoring version)** — the centerpiece feature; use OSRM for real travel-time data
4. **Fission & fusion itinerary** — most time-flexible; a fixed, precomputed activity pool for the demo city is an acceptable shortcut

---

## 6. Known risks to flag during build

- **Group Safe Limit uses minimum, not average** — confirm this is the intended fairness model before building the UI around it; using an average would let higher-budget members outvote the constrained member, which defeats the design's purpose.
- **Weighted scoring weights (0.4/0.3/0.3 above) are placeholders** — tune based on actual demo data, not left as arbitrary constants in the pitch.
- **Simultaneous ejects** and **budget-exhausted ejects** must both be handled explicitly (see section 2.4) — do not ship without a fallback path for either.

---

## 7. Future implementations (post-hackathon)

- Real-time weather-triggered auto-eject suggestions (via a free weather API)
- True graph-based rerouting (multi-hop A*) if the ejected member must be routed through intermediate transit points, not just to a single sanctuary
- Group-level renegotiation flow for simultaneous multi-member ejects
- Cross-trip learning: adapting pace/budget defaults for returning users based on past trip behavior
