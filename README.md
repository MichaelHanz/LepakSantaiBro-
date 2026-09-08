# Group Trip Mediator by Team LepakSantaiBro
**Team:** [Member 1], [Member 2], [Member 3], [Member 4]

**Problem Statement:** Lifestyle Track - Planning an Escape (Travel Planner)

**Video Presentation:** [Insert Unlisted Youtube Link]

**Presentation Slides:** [Insert Public Link]

---

## 1. Project Overview

### The Problem
Group trips are rarely ruined by bad locations; they are ruined by **financial asymmetry and social burnout**. Current market solutions like *Wanderlog* or *TripIt* act purely as geographic itinerary builders. They assume everyone in the group has the same budget and the same energy levels, forcing a "lowest common denominator" consensus. When one person suggests an expensive RM150 dinner, the rest silently stress about it to avoid conflict. When someone gets exhausted and wants to leave, they feel guilty for breaking up the group. Existing apps orchestrate the *places*, but completely ignore the *human friction* of traveling together.

### Our Solution
**Group Trip Mediator** is a ruthless social and financial mediator for group travel. Instead of forcing everyone to agree on a single path, it mathematically protects individual budgets and uses algorithmic pathfinding to seamlessly split, extract, and merge group members when things go wrong.

**Core Features:**
*   **Blind Budget Kill Switch:** Members privately submit their absolute maximum daily budget. The app calculates a hidden "Group Safe Limit" and hard-blocks the planner from adding communal activities that breach the lowest threshold. 
*   **Fission & Fusion Itinerary:** The timeline anchors the group for major events (e.g., Dinner), but injects "Ghost Blocks" where the group is deliberately fractured based on energy pace (Pacesetters go hiking; Spectators go to a cafe).
*   **The "Eject" Engine:** A 1-click panic button on the live itinerary for when a member burns out. It calculates the walking distance/Grab fare to "Basecamp" (Hotel) and provides a deep link to safely extract the user without requiring a group debate.
*   **Opt-In Reconvene (Telegram Bot):** We bypassed the massive battery drain of background tracking. Members link their Telegram, and the bot automatically pings them 30 minutes before crucial "Fusion" events to regroup the squad.
*   **RAG-Lite Anchor Suggestions:** An AI assistant grounded strictly by the Google Places API and the Group Safe Limit, guaranteeing accurate, budget-safe restaurant recommendations.

---

## 2. Ideation & Process

### 2.1 Ideas We Considered

| Idea | Why it was dropped / kept |
| :--- | :--- |
| **Financial Asymmetry & Disaster Recovery (Chosen)** | **Kept.** Targets the highest source of real-world friction. Extremely high originality compared to standard planners. Highly feasible technical scope using deterministic routing and flat arrays. |
| **Energy-Based Planner (SyncPace)** | **Iterated.** Splitting by "high energy" vs "low energy" was a solid start, but lacked the provocative edge. We merged this into the final idea as "Ghost Blocks" but realized financial friction was a much stronger hook for the judges. |
| **Collaborative Map & Upvoting (Wanderlog Clone)** | **Dropped.** The most predictable response to the prompt. Judges have seen this 100 times. Does not solve the anxiety of speaking up against expensive plans. |
| **Generative AI 3-Day Itinerary Builder** | **Dropped.** Stochastic parrots (LLMs) hallucinate closed restaurants and wrong prices. It's technically weak and impossible to trust in a foreign city. |

### 2.2 Ideation Boards

*We realized early on that tracking every single cent ("Rogue Spend") was a mass surveillance liability. We pivoted to a simpler "Kill Switch" to protect privacy while still solving the budget problem.*

![Ideation Mindmap](insert_mindmap_image_url_here.png)
*Our initial mindmap exploring the root causes of group trip arguments, leading us away from geography and toward psychology.*

![User Flow Diagram](insert_user_flow_image_url_here.png)
*The flow chart of our "Proxy Eject" engine, ensuring we don't rely on expensive Google API routing, prioritizing user safety by routing straight to Basecamp.*

### 2.3 Mentor Consultation

| Date | Mentor | Feedback Received | What Was Changed |
| :--- | :--- | :--- | :--- |
| [Date] | [Mentor Name] | Continuous background location tracking drains battery and violates PDPA/Privacy. | **Massive Pivot.** Dropped background tracking completely. Swapped to an "Opt-In Reconvene" system using Telegram push notifications 30-mins before an event. |
| [Date] | [Mentor Name] | Relying purely on Gemini to suggest budget restaurants will result in hallucinations. | **Architecture Change.** Implemented a RAG-Lite system. We now query Google Places API *first*, then feed that real data into Gemini to filter by the budget. |
| [Date] | [Mentor Name] | Complex parallel branching in the UI timeline will cause React state-management hell. | **Scoping Down.** Flattened the database schema. Fission events are now just side-by-side cards in a linear 1D array. |

---

## 3. Design & Prototype

**UI Prototype:** [Insert Public Figma/Vercel Link Here] *(Opens in Incognito)*

*(Embed 4-8 key screenshots here. Example below:)*

![Blind Onboarding](insert_image_1.png)
**1. Blind Threshold Onboarding:** Users privately lock in their social battery and absolute budget limits.

![Fission UI](insert_image_2.png)
**2. The Fission Prompt:** The planner attempts to add a RM150 activity. The Kill Switch blocks it and forces the group to split (Fission).

![Eject Modal](insert_image_3.png)
**3. The Eject Engine:** A user hits their limit. The proxy engine calculates Grab costs and provides a 1-click safe extraction.

![RAG-Lite Suggestions](insert_image_4.png)
**4. Budget-Safe AI Suggestions:** The itinerary planner leverages RAG-Lite to suggest real places that fit the strict Group Safe Limit.

---

## 4. What Makes It Different

*   **Anti-Consensus Philosophy (Novel Twist):** While other apps force the group to vote and agree on everything, our app acts as the bad guy. It actively fractures the group during "Ghost Blocks" to save social batteries, acknowledging that forced consensus ruins trips.
*   **The Eject Engine (Novel Feature):** We went beyond planning and tackled *disaster recovery*. The ability to mathematically extract a member from an itinerary with a deterministic Grab cost estimate is entirely original for a travel app.
*   **Blind Group Safe Limit (Differentiation):** Unlike Splitwise (which tracks debt *after* you overspend), our app prevents budget breaches *before* they happen by aggregating a hidden floor limit that the planner cannot violate.

### Comparison to Existing Solutions

| Feature | Group Trip Mediator | Wanderlog | Splitwise |
| :--- | :--- | :--- | :--- |
| **Focus** | Human Friction & Compromise | Map Geography | Retroactive Debt |
| **Pacing Splits** | Yes (Ghost Blocks) | No (Rigid) | N/A |
| **Budget Control** | Proactive (Kill Switch) | Manual Tracking | Retroactive |
| **Burnout Recovery** | Yes (Proxy Eject) | None | N/A |

---

## 5. Technical Architecture & Feasibility

### Tech Stack
*   **Frontend: React Native (Expo).** Chosen for rapid cross-platform deployment. A custom dev client allows us to compile native modules easily.
*   **Backend: FastAPI (Python).** Chosen for its speed in writing deterministic mathematical engines (calculating the heuristic Grab prices and Group Safe Limits).
*   **Database: Supabase (PostgreSQL).** Chosen for real-time synchronization of the Fission itinerary across all group members' devices, avoiding the need to manually build WebSockets.
*   **Communication: Telegram Bot API.** Chosen to bypass the strict opt-in rules of iOS Web Push notifications (FCM). It guarantees instant delivery for our "Opt-In Reconvene" pings.
*   **APIs: Google Maps Distance Matrix & Places API.** Used strictly as proxies to ground our data. Distance Matrix calculates safe extraction times, and Places API feeds accurate data into our RAG-Lite engine.
*   **AI: Gemini 2.5 Flash.** Used purely as a reasoning engine to filter real-world Places data against strict JSON budgets.
*   **Hosting:** We chose **Render** for our FastAPI backend due to native Python support, and **Vercel** for the React Native Web build. *Constraint:* We must use ngrok during development for the Telegram webhook because localhost cannot be pinged externally.

### System Architecture Diagram
*(Optional but recommended. Embed an image of how your React Native App talks to FastAPI, Supabase, and the 3rd party APIs)*
![System Architecture](insert_architecture_diagram.png)

### Build Plan & Scope
To ensure this was feasible in 48 hours, we aggressively scoped down liabilities:
1.  **No Graph Pathfinding:** We dropped complex A* routing for the Eject engine. We route *only* to a static "Basecamp", reducing API calls from dozens to exactly one.
2.  **No Continuous Tracking:** We dropped background geolocation. The app only requests location exactly when the user hits "Eject".
3.  **Flat Array Ledger:** We dropped complex individual "Rogue Spend" tracking. The ledger only tracks communal events in a flat chronological array, making Supabase reads incredibly fast and bug-free.
