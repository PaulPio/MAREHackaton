# CLAUDE.md

This file provides guidance to AI assistants when working with code in this repository.

## Commands

```bash
# Backend / Agent Scripts (Root)
npm run generate:agent   # Scrape/Analyze salons and generate emails + microsites (Gemini)
npm run merge            # Helper to merge raw data into final salons.json

# Frontend (mare-signal directory)
cd mare-signal
npm run dev             # Vite dev server (Dashboard + Inbox + Microsites)
npm run build           # Production build
```

Prereqs: Node 20+, `GEMINI_API_KEY` in `.env` (copy from `.env.example`).

## Architecture

The project consists of an Agentic Backend and a Vue-based Unified Frontend.

### 1. Agentic Backend (Root)
Node scripts (running via `tsx`) that manage the prospect pipeline:
- `scripts/generateAgent.ts`: Core pipeline. Uses Gemini to research salons, calculate ROI/Fit scores, and generate personalized copy.
- `lib/geminiClient.ts`: Interface for Gemini 1.5 Pro/Flash.
- `data/salons.json`: Central prospect database.
- `data/generated_emails.json`: AI-generated outreach sequences.
- `data/generated_microsite_content.json`: AI-generated landing page copy.

### 2. Unified Frontend (`mare-signal/`)
Vue 3 + Vite + Vue Router application serving three primary views:
- `/` (DashboardView): Map-based prospect discovery.
- `/inbox` (InboxView): CRM-style outreach management with draft preview modal.
- `/site/:id` (MicrositeView): Personalized landing page for the specific salon.

Vite is configured to allow file imports from the root `data/` folder via `server.fs.allow: ['..']`.

### Data Flow
Frontend components import data directly:
`import salonsData from '../../data/salons.json'`

## Brand Voice
All AI-generated copy follows `prompts/mare_voice.md`.
Never use: "Hey there", "amazing", "incredible", "game-changing", "leverage", "synergy", "excited to connect", "hop on a call", exclamation points, or emojis.

## Visual Design
Premium aesthetic:
- Background: `#1A1614` (dark) / `#2A2420` (neutral)
- Primary Teal: `#7C9FA3` (light) / `#296167` (dark)
- Brown Accent: `#D4A373`
- Fonts: **Playfair Display** (headings) + **Manrope** (body)

## Key Constraints
- **Offline Reliability:** All demo data must be pre-generated and stored in `data/`. No live LLM calls in the browser.
- **Single Source of Truth:** `data/salons.json` is the master list. Avoid duplicating it inside the `src/` folder.
- **Routing:** Access `/inbox` for the CRM view and `/site/<id>` for the prospect microsites.
