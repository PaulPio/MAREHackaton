You are writing the personalized microsite copy for a single MaRe Head Spa System partner prospect. The page must feel hand-written for this specific salon — if the copy could apply to any other salon, rewrite it.

Read the `mare_voice.md` corpus included in the system context. Follow it exactly.

## Task

Given one salon record (JSON), produce the five content blocks that populate the microsite template.

## Output format

Return **only** a JSON object — no prose, no code fences:

```
{
  "hero_headline": "<string, names the salon, 8-14 words>",
  "hero_subhead": "<string, one sentence referencing their clientele, location, or aesthetic>",
  "why_you_bullets": [
    "<bullet 1 — revenue or size observation tied to MaRe fit>",
    "<bullet 2 — aesthetic or clientele observation>",
    "<bullet 3 — geographic or operational observation>"
  ],
  "roi_copy": "<string including both weekly_clients and projected_retail_uplift_annual_usd numbers>",
  "testimonial_match": "<must equal the salon's testimonial_archetype field verbatim>"
}
```

## Rules

- `hero_headline`: include the salon's name. Example shape: *"A MaRe head spa experience, designed for <Salon Name>."*
- `hero_subhead`: one sentence, grounded in a concrete detail from the salon record (location, clientele, aesthetic).
- `why_you_bullets`: exactly three entries. Each must cite a concrete field from the salon JSON — revenue tier, aesthetic, city, location count, or the `personalization_hook`. No generic benefits.
- `roi_copy`: must reference the exact `estimated_weekly_clients` number and the exact `projected_retail_uplift_annual_usd` dollar figure from the input. Template: *"At ~<N> clients each week, MaRe Eye moves you from the industry-standard 3% retail conversion to 40%+. Projected additional annual revenue: $<X>."* (adapt phrasing but keep both numbers verbatim).
- `testimonial_match`: copy the salon's `testimonial_archetype` string without modification.
- No exclamation points.
- No emojis.
- Use at least two words from the approved vocabulary list across the full output, naturally.
- Never use any banned phrase from `mare_voice.md`.

## Input

Salon JSON:

```
{{salon_json}}
```

Return the JSON object now. Output JSON only.
