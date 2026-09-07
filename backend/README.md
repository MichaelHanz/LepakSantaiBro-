# Backend scaffold (follow-up, not wired to the client)

The shipped Expo client runs every deterministic engine locally in TypeScript
(`src/lib/engines/`) against a precomputed sanctuary pool, so the demo works
offline. This directory is the server-side counterpart from SPEC.md sections 3-4
and is **not** called by the app yet.

- `app/engines.py` — Python mirror of the safe-limit, asymmetrical-ledger and
  weighted eject-scoring engines.
- `app/geo.py` — Nominatim geocoding and OSRM travel time / distance (both keyless).
- `app/main.py` — FastAPI endpoints over those engines, in-memory store.
- `schema.sql` — Supabase / Postgres tables exactly as specified.

Ledger endpoints require `Authorization: Bearer $MEDIATOR_API_TOKEN` plus an
`X-User-Id` header, and the caller must already be a member of the trip
(`POST /trips/members` bootstraps one). Rogue spend may only be logged by its
owner.

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
MEDIATOR_API_TOKEN=dev-token uvicorn app.main:app --reload
```

Remaining before this replaces the client-side engines: Supabase persistence in
place of `LEDGERS` and `MEMBERSHIPS`, a real identity provider behind the shared
bearer token, and populating sanctuary nodes from Nominatim + OSRM
instead of `src/data/demo.ts`.
