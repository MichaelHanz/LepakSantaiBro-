# Santai Lepak Bro

A native React Native + Expo hackathon prototype for **Group Trip Mediator**: a social and financial mediator for group travel, not another itinerary generator.

## What is in the demo

The home screen is an **agentic chat interface**: you type natural-language requests
("eject Aina", "add RM 60 for dinner", "what's our safe limit") and the agent routes
them to deterministic tools, then answers with a chat bubble plus a rich result card.

- **Asymmetrical ledger** separating communal burn from personal “rogue spend”, guarded by
  the Group Safe Limit (the *minimum* member budget, never the average).
- **Blind threshold onboarding** — constraints are submitted privately and only the
  aggregate is ever surfaced; no member sees another's budget or battery.
- **Eject engine** — weighted nearest-node scoring over sanctuary candidates, with a hard
  budget filter, a cheapest-option fallback, independent handling of simultaneous ejects,
  and a recomputed verdict on whether the ejected member still makes the next anchor node.
- **Fission & fusion itinerary** built from structured anchor nodes and ghost blocks, split
  by each member's pace preference.

The LLM (Gemini primary, Groq fallback) only parses intent and narrates results — every
figure comes from the deterministic engines. With no API key the app falls back to a
keyword/regex parser, so the demo runs fully offline. Trip, member and ledger state
persists locally via AsyncStorage.

### Optional LLM keys

```bash
export EXPO_PUBLIC_GEMINI_API_KEY=...   # primary
export EXPO_PUBLIC_GROQ_API_KEY=...     # fallback
```

## Install and run

Requirements: Node.js 20+, npm, and either an iOS Simulator, Android Emulator, or Expo-compatible device.

```bash
git clone https://github.com/MichaelHanz/LepakSantaiBro-.git
cd LepakSantaiBro-
npm install
npx expo start
```

Then press `i` for iOS, `a` for Android, or scan the QR code with a development build. For browser preview:

```bash
npm run web
```

Run the type checker and engine unit tests before committing:

```bash
npm run typecheck
npm test
```

## Project structure

```text
app/
  _layout.tsx              Expo Router root layout
  index.tsx                Route entry, renders the agent chat screen
src/
  screens/                 AgentChatScreen
  components/chat/         Header, transcript bubbles, prompt bar
  components/cards/        Eject route, ledger, safe-limit, itinerary result cards
  components/onboarding/   Blind constraints sheet
  lib/engines/             Deterministic safe-limit, ledger, eject and itinerary math
  lib/agent/               Intent routing, Gemini/Groq client, tool dispatch
  lib/storage.ts           AsyncStorage persistence
  state/                   Trip state and the useTripAgent hook
  data/demo.ts             Precomputed KL activity and sanctuary pools
backend/                   FastAPI + Supabase scaffold (follow-up, not wired up)
```

## Design direction

The app uses a warm cream canvas, deep forest ink, teal safety states, and coral intervention states. The tone is calm and candid: the product protects the lowest threshold without making anyone publicly negotiate it.

## Next production steps

1. Move member constraints and ledgers into the FastAPI/Supabase backend.
2. Replace precomputed sanctuary nodes with Nominatim + OSRM requests.
3. Add Expo push notifications for reroutes and patched anchors.
4. Add authenticated trip creation and real-time ledger updates.
5. Tune the weighted scoring weights with demo telemetry rather than treating `0.4 / 0.3 / 0.3` as permanent constants.
