# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Production build
npm run lint         # ESLint via next lint
npm run generate     # Generate emails + microsite content for all salons
npm run generate:one -- <salon-id>   # Generate for a single salon (e.g. salon-by-the-sea-miami)
npm run preview      # Preview generated content
```

Generator prereqs: Node 20+, `MINIMAX_API_KEY` in `.env` (copy from `.env.example`).

## Architecture

Two independent systems share a data contract via JSON files:

### 1. Content Generator (`scripts/generate.ts`)
A Node script (runs via `tsx`, not Next.js) that reads `data/salons.json` and writes two output files:
- `data/generated_emails.json` — outreach emails per salon
- `data/generated_microsite_content.json` — microsite copy blocks per salon

Flow per salon: load `prompts/mare_voice.md` as system prompt → render template from `prompts/email_generator.md` or `prompts/microsite_generator.md` → call MiniMax via `lib/minimaxClient.ts` → validate response with Zod → run banned-phrase scan via `lib/bannedPhrases.ts`. Any banned-phrase hit prints a warning; treat it as a blocker for the hero demo salon.

### 2. Next.js Frontend (`app/`)
- `app/page.jsx` — Growth Lead dashboard. Loads `/salons.json` from `public/` (offline-safe), displays a two-column salon list + detail panel with fit score rings, score breakdowns, and draft email toggle.
- `app/for/[slug]/page.tsx` — Personalized microsite per prospect salon.

### Shared types (`lib/types.ts`)
All Zod schemas are here: `SalonSchema`, `GeneratedEmailSchema`, `MicrositeContentSchema`. Changes to the salon data shape must be reflected in both `data/salons.json` and `public/salons.json`.

### Data files
- `data/salons.json` — source of truth, validated against `SalonSchema`
- `public/salons.json` — copy served to the browser (Next.js static serving)
- Keep both in sync; commit generated JSON — the demo must run offline with no live API calls.

## Brand Voice (non-negotiable)

Before writing any user-facing copy, read `prompts/mare_voice.md`. The banned-phrase list in `lib/bannedPhrases.ts` is enforced programmatically — the generator will warn on violations.

Never use: "Hey there", "amazing", "incredible", "game-changing", "leverage", "synergy", "circle back", "excited to connect", "hop on a call", exclamation points, or emojis in copy.

## Visual Design

Color palette is defined in `app/page.jsx` as the `COLORS` constant. Do not introduce new colors outside this palette:
- Background: `#E2E2DE` (light) / `#FFFFFF`
- Primary teal: `#296167` (key) / `#214E52` (darkKey)
- Brown accent: `#653D24` (brown)
- Text: `#2A2420` (extraDark) / `#3B3632` (dark)

Fonts: **Playfair Display** (serif, headings) + **Manrope** (sans, body). Loaded from Google Fonts in the page component.

## Key Constraints

- **Demo runs offline.** All LLM output must be pre-generated and committed. No live API calls during the pitch.
- **Human-in-the-loop.** Nothing auto-sends. The dashboard is approval-only.
- **Single-shot LLM calls.** No streaming, no retries in generator scripts.
- The generator uses **MiniMax**, not Anthropic. LLM client is `lib/minimaxClient.ts`.
