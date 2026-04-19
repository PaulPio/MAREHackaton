# MaRe Signal — Partner Acquisition Engine

> Hackathon project for **MaRe Head Spa System** (Pulse Miami Hackathon, 4-hour build).
> A tool that turns MaRe's generic "For Professionals" contact form into a revenue engine by auto-generating personalized outreach emails and tailored microsites for every qualified luxury salon in the US.

---

## 🎯 The One-Sentence Pitch

MaRe wants 100 luxury salons by end of 2026. They have one Growth Lead. **MaRe Signal** finds the right salons, drafts MaRe-voice outreach, and serves each prospect a personalized microsite — so every qualified salon sees a pitch built for them before they ever take a meeting.

---

## 📐 Context: What is MaRe?

**MaRe Head Spa System** is the world's first all-in-one luxury head spa platform. Tagline: *"Your Head. Your Way. Science Supported."*

**Core products:**

* **MaRe Capsule** — patented luxury massage chair for head spa treatments (zero-gravity recline, ergonomic sink, built-in steam therapy)
* **MaRe Eye** — AI-driven scalp & hair diagnostic camera that generates personalized reports and product recommendations
* **MaRe x Philip Martin's** — exclusive US distribution of Philip Martin's biodynamic organic Italian cosmetics
* **MaRe Tools** — wind dryer, brush series, red light therapy tools, massage tools

**Business model:** B2B sales to salons/spas/hotels/wellness centers. Partners purchase hardware + get inventory of Philip Martin's retail. MaRe Eye drives retail conversion from industry-standard  **3% to 40%+** , plus ongoing commission from client repurchases via the Monarch Club database.

**Why it matters now:**

* Global scalp care market projected $23.8B by 2032 (7% CAGR)
* "Scalp spa" searches up 153% YoY (5,400/month avg)
* 50% of salons plan to adopt AI tools for diagnosis by 2025
* Spa operating margins 15–35%

**Stated goal:** 100 salon partners by end of 2026. Currently ~100 locations in Coral Gables/Miami area.

---

## 😩 The Problem We're Solving

MaRe's partner funnel has a critical weak spot.

1. **Prospecting is manual.** Finding the right $1M+ luxury salons across the US is slow networking work.
2. **Outreach risks killing the brand.** Generic automation feels like "AI spam" — incompatible with a $130/session luxury product.
3. **The landing page is thin.** [mareheadspa.com/pages/for-professionals](https://mareheadspa.com/pages/for-professionals) is currently a generic contact form with no value prop, no ROI data, no personalization, no social proof.

**Insight:** The landing page is where we can create the most outsized impact. Every qualified salon should land on something that feels handcrafted for them.

---

## 🏗️ What We're Building

Three connected pieces:

### 1. The Prospector (Dashboard)

Growth Lead view. Lists qualified salons with fit scores (0–100), signal reasons, and AI-drafted outreach emails. Human-in-the-loop approve/edit/send flow.

### 2. The Email Engine

Takes salon data → produces a 3-sentence email in MaRe voice:

* **Hook:** reference a specific salon signal (aesthetic, location, recent news)
* **Value:** MaRe Eye as retail upsell tool (3% → 40%+ conversion)
* **Guardrail:** mutual exclusivity — MaRe only partners with venues that match its standard

### 3. The Personalized Microsite

One URL per prospect salon (e.g. `/for/salon-by-the-sea`). Four sections:

* **Hero** — personalized headline + subhead
* **Why You** — 3 tailored bullets based on their business
* **ROI Block** — pre-filled dollar projection based on their size
* **CTA** — "Book a walkthrough with Rebecca" with pre-filled contact form

---

## 👥 Target Users

**Primary: The MaRe Growth Lead (Rebecca / Marianna)**
Needs scale without sacrificing perfection. Wants "human-in-the-loop" approval before anything gets sent. Not a prompt engineer — needs a clean dashboard.

**Secondary: The Prospective Salon Owner**
Busy, not tech-literate, cares about retail revenue and client retention. Responds to personalized value, not generic pitches. Needs to feel understood and empowered as a MaRe channel partner.

---

## 🗣️ Brand Voice (CRITICAL — follow exactly)

MaRe is **science + luxury + Italian craft.** Not fluffy wellness. Not bro-y sales.

### ✅ Use these words

systematic, protocol, ritual, biodynamic, trichologist-developed, patented, scalp longevity, head health, wellness, curated, clinical, science-supported, rooted in research, bespoke, exclusive, Italian organic, luxury, head spa

### ❌ Never use these

* "Hey there," / "Hope this finds you well,"
* "Amazing," "incredible," "game-changing"
* "Leverage," "synergy," "circle back," "touch base"
* "Excited to connect," "quick call," "hop on a call"
* Emojis in professional copy
* Exclamation points (MaRe doesn't shout)

### Voice anchors (from mareheadspa.com)

* *"Your Head. Your Way. Science Supported."*
* *"Rooted in Research."*
* *"Developed with leading trichologists, professors, and researchers."*
* *"The world's first system to unite advanced assessments, global wellness rituals, and premium scalp treatments."*

### Example — good email (~50 words)

> Subject: A curated opportunity for [Salon Name]
>
> [Salon Name]'s Coral Gables location already signals the clientele MaRe is built for. MaRe Eye, our trichologist-developed scalp diagnostic, takes retail conversion from the industry-standard 3% to 40%+ by tying every Philip Martin's recommendation to real scalp data. We partner exclusively with salons that match our standard — I'd like to explore whether yours does.

### Example — bad email (what we're replacing)

> Hey! Hope this finds you well. I wanted to reach out because I think MaRe could be an amazing fit for your salon. We're a game-changing head spa system that would leverage your existing clientele to drive incredible results. Would love to hop on a quick call!

---

## 🎨 Visual Design

Match mareheadspa.com exactly. Founders should feel: *"this could ship next week."*

**Palette**

* Background: warm sand `#F5F1EA`
* Primary dark: deep teal `#2C4A4F`
* Accent: muted copper / tan `#B8916A`
* Text: near-black `#1A1A1A`

**Typography**

* Headlines: serif — **Fraunces** or **Cormorant Garamond**
* Body: sans — **Inter** or system sans
* Generous whitespace. Never cramped.

**Layout principles**

* Full-bleed hero images with restrained type
* Lots of negative space — luxury = restraint
* Subtle dividers, never heavy borders
* One CTA per screen, never multiple competing buttons

---

## 🛠️ Tech Stack

* **Frontend:** Next.js + Tailwind (via Vercel v0)
* **LLM:** Claude Sonnet 4.5 via Anthropic API (best for brand-voice-sensitive tasks)
* **Data scraping:** **Firecrawl** agent for Person 1's salon discovery task (see `/agents/prospector` below)
* **Data storage:** JSON files for hackathon — `data/salons.json`, `data/generated_content.json`
* **Hosting:** Vercel (deploy via v0)

---

## 📁 Project Structure

```
/mare-signal
├── README.md                          # This file
├── data/
│   ├── salons.json                    # Person 1 output: salon list with signals
│   ├── generated_emails.json          # Person 2 output: drafted outreach
│   └── generated_microsite_content.json  # Person 2 output: page copy per salon
├── agents/
│   └── prospector/
│       ├── firecrawl_scraper.ts       # Firecrawl agent for salon discovery
│       ├── scoring.ts                 # Fit-score rubric
│       └── README.md                  # Person 1's agent instructions
├── prompts/
│   ├── mare_voice.md                  # Brand voice training corpus
│   ├── email_generator.md             # Email prompt template
│   └── microsite_generator.md         # Microsite copy prompt template
├── app/
│   ├── dashboard/page.tsx             # Growth Lead prospector view
│   └── for/[slug]/page.tsx            # Dynamic personalized microsite
└── components/
    ├── SalonCard.tsx
    ├── EmailPreview.tsx
    ├── MicrositeHero.tsx
    ├── WhyYouBlock.tsx
    └── ROICalculator.tsx
```

---

## 🤖 The Firecrawl Prospector Agent (Person 1)

Person 1's task is fully agentic — **Firecrawl discovers, enriches, and scores luxury salons automatically.**

### What the agent does

1. **Discover** — given a seed list of US cities + business types (salon / day spa / med spa / hotel spa / wellness clinic), scrape directories and search for qualifying venues
2. **Extract** — for each venue, pull: name, website, city, Instagram handle, service menu, price points, location count, "about us" copy
3. **Enrich** — infer revenue tier, aesthetic tag, one personalization hook, estimated weekly client volume
4. **Score** — apply the fit rubric (see below) to produce a 0–100 fit score with reason codes
5. **Output** — write `data/salons.json` for Person 2 and Person 3 to consume

### Firecrawl agent prompt (starter)

```
You are a salon prospecting agent for MaRe Head Spa System, a luxury B2B
head spa platform that partners with venues generating $1M+ annual revenue.

For each venue at {url}, extract:
- name (string)
- city, state (string)
- website (string)
- instagram_handle (string or null)
- business_type (one of: salon | day_spa | med_spa | hotel_spa | wellness_clinic)
- service_price_range (min_usd, max_usd) — infer from their service menu page
- location_count (int) — check for "locations" or "find us" pages
- about_copy (string, max 500 chars) — their self-description
- aesthetic_signals (array of tags: modern-minimal | classic-luxe | organic-wellness | clinical-medical | celebrity-haunt)
- personalization_hook (string, one specific detail a human would notice — recent expansion, award, named stylist, notable clientele)

Then compute fit_score (0-100) using the rubric in scoring.ts.

Return strict JSON matching the Salon schema.
```

### Fit Score Rubric (`scoring.ts`)

| Dimension           | Weight | What earns points                                                     |
| ------------------- | -----: | --------------------------------------------------------------------- |
| Revenue tier        |     30 | $1M+ = 20, $2M+ = 25, $5M+ = 30                                       |
| Luxury signal       |     25 | Service prices $150+, awards, Forbes/Michelin, celebrity clients      |
| Location fit        |     15 | HNW metros (Miami, NYC, LA, SF, Aspen, Palm Beach, Hamptons)          |
| Aesthetic fit       |     20 | Clean modern or classic-luxe. Avoid clinical-medical or trend-chasing |
| Expansion readiness |     10 | Multi-location, recent openings, active PR, hiring                    |

Output: `{ score: 87, reasons: ["$2M+ tier (25)", "Palm Beach location (15)", ...] }`

### Seed targets (what to feed the agent)

Known luxury benchmarks from the brief:

* IGK
* DePasquale Circle of Beauty
* Desange
* Rosano Ferretti

Expansion categories to search:

* Forbes Five-Star Spa directory
* Leading Hotels of the World spa partners
* Aman, Rosewood, Four Seasons spa locations
* Top 100 salons by regional publications (Elle, Vogue, New York Mag)

### Output schema — `data/salons.json`

```json
[
  {
    "id": "salon-by-the-sea-miami",
    "name": "Salon by the Sea",
    "city": "Coral Gables, FL",
    "website": "https://salonbythesea.example",
    "instagram": "@salonbythesea",
    "business_type": "salon",
    "revenue_tier": "$1M-$2M",
    "location_count": 2,
    "aesthetic": ["modern-minimal", "organic-wellness"],
    "personalization_hook": "Recently opened a second location in Palm Beach with a dedicated wellness floor",
    "fit_score": 87,
    "score_reasons": [
      "$1M+ revenue tier (20pts)",
      "Palm Beach HNW location (15pts)",
      "Aesthetic match — clean modern + wellness (20pts)",
      "Recent expansion signals expansion readiness (10pts)",
      "Multi-location (bonus)"
    ],
    "estimated_weekly_clients": 40,
    "projected_retail_uplift_annual_usd": 187000,
    "testimonial_archetype": "boutique-multi-location"
  }
]
```

---

## 📧 Email Generator Prompt Template (Person 2)

Input: one salon object from `salons.json`
Output: JSON `{ subject: string, body: string }` — body ≤ 3 sentences

```
System: You write in MaRe's voice. Read prompts/mare_voice.md before every generation.

MaRe is a luxury head spa system. You are drafting outreach from MaRe's
Growth Lead to a prospective salon partner. Your output will be reviewed
by a human before sending.

Rules:
- Exactly 3 sentences in the body
- Structure: Hook → Value → Guardrail
- Hook: reference the salon's personalization_hook specifically
- Value: mention MaRe Eye + the 3% → 40%+ retail conversion lift
- Guardrail: emphasize mutual exclusivity ("we only partner with venues that match MaRe's standard")
- Never use the banned phrases from mare_voice.md
- Sign off: "— Rebecca"

Input salon: {salon_json}

Output: { "subject": "...", "body": "..." }
```

---

## 🖼️ Microsite Generator Prompt Template (Person 2)

Input: salon object
Output: JSON with 5 content blocks to populate the microsite template

```
You are generating copy for a personalized MaRe partner microsite.
Every piece of copy must feel hand-written for this specific salon.

Input salon: {salon_json}

Generate:
{
  "hero_headline": "A MaRe Head Spa experience, designed for [Salon Name].",
  "hero_subhead": "[1-sentence reference to their specific clientele, location, or aesthetic]",
  "why_you_bullets": [
    "[Bullet 1 — revenue/size observation tied to MaRe fit]",
    "[Bullet 2 — aesthetic or clientele observation]",
    "[Bullet 3 — geographic or operational observation]"
  ],
  "roi_copy": "At ~[weekly_clients] clients/week, MaRe Eye moves you from ~3% retail conversion to 40%+. Projected additional annual revenue: $[amount].",
  "testimonial_match": "[archetype ID from testimonial_archetype field]"
}

Voice rules: See prompts/mare_voice.md — same banned phrases apply.
```

---

## 🧭 4-Hour Execution Timeline

| Time   | Milestone                                                                                                                                            |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| T+0:00 | Kickoff. Lock product name, hero demo salon, palette. Split tasks.                                                                                   |
| T+0:30 | Hero demo salon locked. Everyone builds toward it.                                                                                                   |
| T+1:00 | Person 1:`salons.json`v1 published (10 salons). Person 2:`mare_voice.md`assembled. Person 3: v0 scaffold live. Person 4: founder interview done. |
| T+2:00 | **HARD INTEGRATION CHECKPOINT.**Data → prompts → UI wired end-to-end. If not, cut scope.                                                           |
| T+3:00 | **Feature freeze.**Polish only from here.                                                                                                            |
| T+3:30 | Full dress rehearsal. Time the demo (≤ 2 min). Cut anything over.                                                                                   |
| T+4:00 | Demo.                                                                                                                                                |

---

## 🏆 Judging Criteria (from the prompt)

Founders evaluate on "would I invest?"

1. **Brand Fidelity** — does output feel $130/session luxury or AI spam?
2. **Data Precision** — did the tool filter for $1M+ revenue salons accurately?
3. **Outreach Efficacy** — does the hook use "Salon Lingo" to put meetings on calendars?
4. **Scalability** — how seamlessly does one signal become 50 assets?
5. **AI Search Dominance** — does MaRe surface first for relevant queries?

---

## 🚨 Non-Negotiables

* **Match MaRe's voice exactly.** When in doubt, re-read `prompts/mare_voice.md`.
* **Match MaRe's visual design.** The microsite should be indistinguishable from a real MaRe page.
* **Human-in-the-loop everywhere.** Nothing auto-sends. Growth Lead approves every email.
* **Demo one hero salon deeply** beats 10 shallow examples.

---

## 📞 Key Links

* MaRe site: https://mareheadspa.com/
* The weak page we're replacing: https://mareheadspa.com/pages/for-professionals
* Blog (voice reference): https://mareheadspa.com/blogs/all-posts
* About (voice reference): https://mareheadspa.com/pages/about-us
* Instagram: https://www.instagram.com/mareheadspa/

---

## 🧠 Instructions for the IDE / AI Assistant

When generating any code or content for this project:

1. **Read `prompts/mare_voice.md` first** before writing any user-facing copy.
2. **Never deviate from the palette and typography** defined in the Visual Design section.
3. **Every microsite variant must feel personalized** — if the copy could apply to any salon, rewrite it.
4. **Prefer restraint over features** — luxury = subtraction. If in doubt, remove.
5. **The microsite is the hero.** Spend polish budget there first.
6. **Check outputs against banned-phrases list** before considering them done.
7. **All LLM calls should be single-shot with strict JSON output** — no streaming, no retries during demo.
8. **Assume the demo runs offline** — bake all generated content into JSON files ahead of time. No live API calls during the pitch.
