import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SalonSchema, GeneratedEmailSchema, MicrositeContentSchema } from "../lib/types.js";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const DATA = resolve(ROOT, "data");

const salons = z.array(SalonSchema).parse(JSON.parse(readFileSync(resolve(DATA, "salons.json"), "utf8")));
const emails = z.array(GeneratedEmailSchema).parse(JSON.parse(readFileSync(resolve(DATA, "generated_emails.json"), "utf8")));
const microsites = z.array(MicrositeContentSchema).parse(JSON.parse(readFileSync(resolve(DATA, "generated_microsite_content.json"), "utf8")));

function salonCard(salonId: string): string {
  const salon = salons.find(s => s.id === salonId)!;
  const email = emails.find(e => e.salon_id === salonId)!;
  const ms = microsites.find(m => m.salon_id === salonId)!;

  const bullets = ms.why_you_bullets.map(b => `<li>${b}</li>`).join("\n");

  return `
<section class="salon-block">

  <!-- MICROSITE PREVIEW -->
  <div class="microsite">
    <div class="microsite-hero">
      <p class="eyebrow">Personalized Microsite — /for/${salonId}</p>
      <h1 class="hero-headline">${ms.hero_headline}</h1>
      <p class="hero-subhead">${ms.hero_subhead}</p>
    </div>

    <div class="microsite-body">
      <div class="section">
        <h2 class="section-title">Why You</h2>
        <ul class="why-bullets">${bullets}</ul>
      </div>

      <div class="section roi-block">
        <h2 class="section-title">Your ROI</h2>
        <p class="roi-copy">${ms.roi_copy}</p>
      </div>

      <div class="section cta-block">
        <a class="cta-button" href="#">Book a walkthrough with Rebecca</a>
        <p class="cta-sub">Fit score: <strong>${salon.fit_score}/100</strong> &nbsp;·&nbsp; ${salon.city}</p>
      </div>
    </div>
  </div>

  <!-- EMAIL PREVIEW -->
  <div class="email-preview">
    <p class="eyebrow">Outreach Email Draft</p>
    <p class="email-subject"><strong>Subject:</strong> ${email.subject}</p>
    <pre class="email-body">${email.body}</pre>
  </div>

  <!-- SALON META -->
  <details class="salon-meta">
    <summary>Salon data (from salons.json)</summary>
    <pre>${JSON.stringify(salon, null, 2)}</pre>
  </details>

</section>`;
}

const allCards = salons.map(s => salonCard(s.id)).join('\n<hr class="salon-divider">\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MaRe Signal — Content Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --sand:   #F5F1EA;
    --teal:   #2C4A4F;
    --copper: #B8916A;
    --ink:    #1A1A1A;
    --muted:  #6B7280;
    --border: #E2DDD5;
  }

  body {
    background: var(--sand);
    color: var(--ink);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    padding: 0 0 80px;
  }

  .page-header {
    background: var(--teal);
    color: #fff;
    padding: 32px 48px;
    margin-bottom: 64px;
  }
  .page-header h1 { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 400; }
  .page-header p  { font-size: 0.875rem; opacity: 0.7; margin-top: 4px; }

  .salon-block { max-width: 860px; margin: 0 auto 0; padding: 0 32px; }
  .salon-divider { border: none; border-top: 1px solid var(--border); margin: 72px auto; max-width: 860px; }

  /* MICROSITE */
  .microsite { background: #fff; border-radius: 2px; overflow: hidden; margin-bottom: 32px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }

  .microsite-hero {
    background: var(--teal);
    color: #fff;
    padding: 56px 48px 48px;
  }
  .eyebrow {
    font-size: 0.7rem;
    letter-spacing: .12em;
    text-transform: uppercase;
    opacity: 0.55;
    margin-bottom: 20px;
    font-family: 'Inter', sans-serif;
  }
  .hero-headline {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    font-weight: 400;
    line-height: 1.2;
    margin-bottom: 16px;
  }
  .hero-subhead {
    font-size: 1rem;
    opacity: 0.8;
    max-width: 560px;
  }

  .microsite-body { padding: 40px 48px 48px; }
  .section { margin-bottom: 40px; }
  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--teal);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .why-bullets { list-style: none; padding: 0; }
  .why-bullets li {
    padding: 10px 0 10px 20px;
    border-bottom: 1px solid var(--border);
    position: relative;
    font-size: 0.9375rem;
  }
  .why-bullets li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 19px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--copper);
  }

  .roi-block { background: var(--sand); padding: 24px; border-radius: 2px; }
  .roi-copy { font-size: 1rem; line-height: 1.7; color: var(--ink); }

  .cta-block { text-align: center; padding-top: 8px; }
  .cta-button {
    display: inline-block;
    background: var(--teal);
    color: #fff;
    text-decoration: none;
    padding: 14px 36px;
    font-size: 0.875rem;
    letter-spacing: .05em;
    font-family: 'Inter', sans-serif;
  }
  .cta-sub { margin-top: 12px; font-size: 0.8rem; color: var(--muted); }

  /* EMAIL */
  .email-preview {
    background: #fff;
    border-left: 3px solid var(--copper);
    padding: 28px 32px;
    margin-bottom: 24px;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
  }
  .email-preview .eyebrow { color: var(--copper); margin-bottom: 12px; }
  .email-subject { font-size: 0.9rem; margin-bottom: 16px; color: var(--muted); }
  .email-body {
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    line-height: 1.75;
    white-space: pre-wrap;
    color: var(--ink);
  }

  /* META */
  .salon-meta { margin-top: 8px; }
  .salon-meta summary {
    font-size: 0.75rem;
    color: var(--muted);
    cursor: pointer;
    user-select: none;
    padding: 8px 0;
  }
  .salon-meta pre {
    font-size: 0.7rem;
    background: #f0ede8;
    padding: 16px;
    margin-top: 8px;
    overflow-x: auto;
    border-radius: 2px;
    line-height: 1.5;
    color: var(--muted);
  }
</style>
</head>
<body>

<header class="page-header">
  <h1>MaRe Signal — Content Preview</h1>
  <p>Person 2 output &nbsp;·&nbsp; ${salons.length} salons &nbsp;·&nbsp; Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
</header>

${allCards}

</body>
</html>`;

const outPath = resolve(ROOT, "preview.html");
writeFileSync(outPath, html);
console.log(`✓ preview.html written — open it in your browser`);
console.log(`  ${outPath}`);
