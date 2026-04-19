import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

const dataSalons: Array<{ id: string; name: string }> = JSON.parse(
  readFileSync(resolve(ROOT, "data/salons.json"), "utf8"),
);
const generatedEmails: Array<{ salon_id: string; subject: string; body: string }> = JSON.parse(
  readFileSync(resolve(ROOT, "data/generated_emails.json"), "utf8"),
);
const publicSalons: Array<Record<string, unknown>> = JSON.parse(
  readFileSync(resolve(ROOT, "public/salons.json"), "utf8"),
);

const nameToId = new Map(dataSalons.map((s) => [s.name, s.id]));
const emailById = new Map(generatedEmails.map((e) => [e.salon_id, e]));

let enriched = 0;
const merged = publicSalons.map((salon) => {
  const name = salon.name as string;
  const id = nameToId.get(name);
  const email = id ? emailById.get(id) : undefined;
  if (email) {
    enriched++;
    return { ...salon, outreach_email: email.body, outreach_subject: email.subject };
  }
  return salon;
});

writeFileSync(resolve(ROOT, "public/salons.json"), JSON.stringify(merged, null, 2) + "\n");
console.log(`✓ merge complete — ${enriched}/${publicSalons.length} salons enriched with email content`);

if (enriched < publicSalons.length) {
  const unmatched = publicSalons
    .filter((s) => !nameToId.has(s.name as string))
    .map((s) => s.name);
  console.warn(`  ⚠ unmatched salons (name not in data/salons.json):`);
  unmatched.forEach((n) => console.warn(`    - ${n}`));
}
