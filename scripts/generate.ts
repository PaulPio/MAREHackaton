import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GeneratedEmail,
  GeneratedEmailSchema,
  MicrositeContent,
  MicrositeContentSchema,
  Salon,
  SalonSchema,
} from "../lib/types.js";
import { chatJSON } from "../lib/geminiClient.js";
import { loadPrompt, renderPrompt } from "../lib/loadPrompt.js";
import { checkBanned, BannedHit } from "../lib/bannedPhrases.js";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const DATA = resolve(ROOT, "data");

const SALONS_PATH = resolve(DATA, "salons.json");
const EMAILS_OUT = resolve(DATA, "generated_emails.json");
const MICROSITES_OUT = resolve(DATA, "generated_microsite_content.json");

type VoiceWarning = {
  salon_id: string;
  artifact: "email" | "microsite";
  hits: BannedHit[];
};

function parseArgs(): { onlyId?: string } {
  const args = process.argv.slice(2);
  const onlyIdx = args.indexOf("--only");
  const onlyId = onlyIdx !== -1 ? args[onlyIdx + 1] : undefined;
  return { onlyId };
}

function loadSalons(): Salon[] {
  const raw = JSON.parse(readFileSync(SALONS_PATH, "utf8"));
  const parsed = z.array(SalonSchema).safeParse(raw);
  if (!parsed.success) {
    console.error("salons.json failed schema validation:");
    console.error(parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
}

async function generateEmail(salon: Salon, template: string): Promise<GeneratedEmail> {
  const voice = loadPrompt("mare_voice.md");
  const user = renderPrompt(template, { salon_json: JSON.stringify(salon, null, 2) });
  const { parsed } = await chatJSON<{ subject: string; body: string }>(
    [
      { role: "system", content: voice },
      { role: "user", content: user },
    ],
    { temperature: 0.3, maxTokens: 600 },
  );
  const validated = GeneratedEmailSchema.parse({
    salon_id: salon.id,
    subject: parsed.subject,
    body: parsed.body,
  });
  return validated;
}

async function generateMicrosite(salon: Salon, template: string): Promise<MicrositeContent> {
  const voice = loadPrompt("mare_voice.md");
  const user = renderPrompt(template, { salon_json: JSON.stringify(salon, null, 2) });
  const { parsed } = await chatJSON<Omit<MicrositeContent, "salon_id">>(
    [
      { role: "system", content: voice },
      { role: "user", content: user },
    ],
    { temperature: 0.3, maxTokens: 900 },
  );
  const validated = MicrositeContentSchema.parse({
    salon_id: salon.id,
    ...parsed,
  });
  return validated;
}

function voiceScan(
  salon: Salon,
  email: GeneratedEmail,
  microsite: MicrositeContent,
): VoiceWarning[] {
  const warnings: VoiceWarning[] = [];
  const emailText = `${email.subject}\n${email.body}`;
  const emailHits = checkBanned(emailText);
  if (emailHits.length) warnings.push({ salon_id: salon.id, artifact: "email", hits: emailHits });

  const micrositeText = [
    microsite.hero_headline,
    microsite.hero_subhead,
    ...microsite.why_you_bullets,
    microsite.roi_copy,
  ].join("\n");
  const micrositeHits = checkBanned(micrositeText);
  if (micrositeHits.length)
    warnings.push({ salon_id: salon.id, artifact: "microsite", hits: micrositeHits });

  return warnings;
}

async function main(): Promise<void> {
  const { onlyId } = parseArgs();
  const allSalons = loadSalons();
  const salons = onlyId ? allSalons.filter((s) => s.id === onlyId) : allSalons;
  if (!salons.length) {
    console.error(`No salons matched. onlyId=${onlyId}. Available: ${allSalons.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }

  const emailTemplate = loadPrompt("email_generator.md");
  const micrositeTemplate = loadPrompt("microsite_generator.md");

  const emails: GeneratedEmail[] = [];
  const microsites: MicrositeContent[] = [];
  const warnings: VoiceWarning[] = [];

  for (const salon of salons) {
    console.log(`→ ${salon.id} (${salon.name})`);
    try {
      const email = await generateEmail(salon, emailTemplate);
      const microsite = await generateMicrosite(salon, micrositeTemplate);
      emails.push(email);
      microsites.push(microsite);
      warnings.push(...voiceScan(salon, email, microsite));
    } catch (err) {
      console.error(`  ✗ failed: ${(err as Error).message}`);
      throw err;
    }
  }

  writeFileSync(EMAILS_OUT, JSON.stringify(emails, null, 2) + "\n");
  writeFileSync(MICROSITES_OUT, JSON.stringify(microsites, null, 2) + "\n");

  console.log(`\n✓ ${salons.length} salon${salons.length === 1 ? "" : "s"} generated`);
  console.log(`  ${EMAILS_OUT}`);
  console.log(`  ${MICROSITES_OUT}`);

  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} banned-phrase warning${warnings.length === 1 ? "" : "s"}:`);
    for (const w of warnings) {
      for (const h of w.hits) {
        console.log(`  [${w.salon_id} · ${w.artifact}] "${h.phrase}" → ${h.context}`);
      }
    }
    console.log("\nReview the flagged outputs and re-run if needed.");
  } else {
    console.log("✓ no banned-phrase hits");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
