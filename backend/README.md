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

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Remaining before this replaces the client-side engines: Supabase persistence in
place of `LEDGERS`, auth, and populating sanctuary nodes from Nominatim + OSRM
instead of `src/data/demo.ts`.
