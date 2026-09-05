# Santai Lepak Bro

A native React Native + Expo hackathon prototype for **Group Trip Mediator**: a social and financial mediator for group travel, not another itinerary generator.

## What is in the demo

- **Fission & fusion day plan** with shared Anchor Nodes and intentionally split Ghost Blocks.
- **Asymmetrical ledger** separating communal burn from personal “rogue spend”, with a deterministic guard that uses the lowest member budget as the Group Safe Limit.
- **Blind threshold member view** showing pace preference, social battery, and daily budget without exposing private answers.
- **Eject flow** with a working modal and precomputed weighted nearest-node route to The Zhongshan Building. The confirmation patches the evening fusion point and gives visible feedback.

The prototype keeps the core product math local and deterministic so it is reliable during a pitch. External routing, Supabase sync, auth, and LLM narration are intentionally represented with precomputed demo data for the hackathon build.

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

Run the type checker before committing:

```bash
npm run typecheck
```

## Project structure

```text
app/
  _layout.tsx   Expo Router root layout
  index.tsx     Single-screen native demo with Trip, Money, People tabs
app.json        Expo app metadata and native package identifiers
package.json    Expo / React Native dependencies and scripts
tsconfig.json   Strict TypeScript configuration
```

## Design direction

The app uses a warm cream canvas, deep forest ink, teal safety states, and coral intervention states. The tone is calm and candid: the product protects the lowest threshold without making anyone publicly negotiate it.

## Next production steps

1. Move member constraints and ledgers into the FastAPI/Supabase backend.
2. Replace precomputed sanctuary nodes with Nominatim + OSRM requests.
3. Add Expo push notifications for reroutes and patched anchors.
4. Add authenticated trip creation and real-time ledger updates.
5. Tune the weighted scoring weights with demo telemetry rather than treating `0.4 / 0.3 / 0.3` as permanent constants.
