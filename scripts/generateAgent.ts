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
import { agentLoop, chatJSON, type AgentMessage } from "../lib/geminiClient.js";
import { loadPrompt, renderPrompt } from "../lib/loadPrompt.js";
import { checkBanned } from "../lib/bannedPhrases.js";
import { AGENT_TOOLS, executeAgentTool } from "../lib/agentTools.js";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const DATA = resolve(ROOT, "mare-signal/data");

const SALONS_PATH = resolve(DATA, "salons.json");
const EMAILS_OUT = resolve(DATA, "generated_emails.json");
const MICROSITES_OUT = resolve(DATA, "generated_microsite_content.json");

/* ─── Agent system prompt ─── */

const AGENT_SYSTEM_PROMPT = `You are MaRe's outreach agent. Your job is to draft a 3-sentence partner email
in MaRe's voice, then verify it with tools before submitting.

Workflow:
1. Draft the email (Hook → Value → Guardrail, signed — Rebecca).
2. Call check_banned_phrases on your draft (pass the full body including signature). If violations exist, revise and re-check.
3. Call count_sentences on the body. If not exactly 3, revise and re-check.
4. When both checks pass, call submit_email with the final subject and body to finalize.

Never submit without passing both checks. Maximum 3 revision attempts.
If you reach 3 failed attempts, submit your best attempt anyway.

Important:
- Always call the tools — do NOT try to self-verify silently.
- The banned phrases check and sentence count are enforced by tools, not by you.
- You may call check_banned_phrases and count_sentences in the same turn.
`;

/* ─── CLI args ─── */

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

/* ─── Per-salon agent run ─── */

async function generateEmailAgent(salon: Salon): Promise<GeneratedEmail> {
  const voice = loadPrompt("mare_voice.md");

  // The system contains the voice corpus + the agent workflow instructions.
  const systemContent = `${voice}\n\n---\n\n${AGENT_SYSTEM_PROMPT}`;

  // User message: give the salon data and ask to start — do NOT ask for raw JSON
  // output here (that would suppress tool calls). The agent workflow handles output.
  const userMessage =
    `Here is the salon record for this outreach:\n\n` +
    `\`\`\`json\n${JSON.stringify(salon, null, 2)}\n\`\`\`\n\n` +
    `Draft the email, verify it with check_banned_phrases and count_sentences, ` +
    `then call submit_email to finalize.`;

  const messages: AgentMessage[] = [
    { role: "system", content: systemContent },
    { role: "user", content: userMessage },
  ];

  let iteration = 0;

  const { finalContent, history, terminated } = await agentLoop(
    messages,
    AGENT_TOOLS,
    {
      temperature: 0.4,
      maxTokens: 1500,
      maxIterations: 10,
      terminalTool: "submit_email",
      executeTool: executeAgentTool,
      onToolCall: (name, args, result) => {
        iteration++;
        const resultStr = JSON.stringify(result);
        const shortResult = resultStr.length > 200 ? resultStr.slice(0, 200) + "…" : resultStr;
        console.log(`    → tool [${iteration}]: ${name}  result: ${shortResult}`);
      },
    },
  );

  // ── Extract email from agent result ──────────────────────────────────────
  let subject = "";
  let body = "";

  // Strategy 1: terminated via submit_email — read the tool-result message
  if (terminated) {
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if (msg.role === "tool" && "tool_call_id" in msg) {
        try {
          const data = JSON.parse(msg.content);
          if (data.approved && data.subject && data.body) {
            subject = data.subject;
            body = data.body;
            break;
          }
        } catch { /* skip */ }
      }
    }
    // Also scan assistant messages for the tool_calls arguments
    if (!subject || !body) {
      for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i] as any;
        if (msg.role === "assistant" && Array.isArray(msg.tool_calls)) {
          for (const tc of msg.tool_calls) {
            if (tc.function.name === "submit_email") {
              try {
                const args = JSON.parse(tc.function.arguments);
                subject = args.subject ?? "";
                body = args.body ?? "";
              } catch { /* skip */ }
            }
          }
        }
        if (subject && body) break;
      }
    }
  }

  // Strategy 2: model returned a text/JSON response without using tools
  if (!subject || !body) {
    const textToTry = finalContent ?? "";
    if (textToTry) {
      // Try straight JSON parse
      try {
        const parsed = JSON.parse(textToTry.trim());
        subject = parsed.subject ?? "";
        body = parsed.body ?? "";
      } catch {
        // Try loose extraction: find { ... }
        const first = textToTry.indexOf("{");
        const last = textToTry.lastIndexOf("}");
        if (first !== -1 && last > first) {
          try {
            const parsed = JSON.parse(textToTry.slice(first, last + 1));
            subject = parsed.subject ?? "";
            body = parsed.body ?? "";
          } catch { /* give up */ }
        }
      }
    }
  }

  if (!subject || !body) {
    // Emit debug info so we can see what the model returned
    console.error("  [debug] terminated=", terminated);
    console.error("  [debug] finalContent:", finalContent?.slice(0, 400));
    console.error("  [debug] last 3 history messages:", JSON.stringify(history.slice(-3), null, 2).slice(0, 1000));
    throw new Error(`Agent failed to produce a valid email for ${salon.id}`);
  }

  const validated = GeneratedEmailSchema.parse({
    salon_id: salon.id,
    subject,
    body,
  });

  return validated;
}

/* ─── Microsite generation (single-shot, not agentic) ─── */

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

/* ─── Main ─── */

async function main(): Promise<void> {
  const { onlyId } = parseArgs();
  const allSalons = loadSalons();
  const salons = onlyId ? allSalons.filter((s) => s.id === onlyId) : allSalons;

  if (!salons.length) {
    console.error(
      `No salons matched. onlyId=${onlyId}. Available: ${allSalons.map((s) => s.id).join(", ")}`,
    );
    process.exit(1);
  }

  console.log(`\n🔄 MaRe Agent — generating emails + microsites for ${salons.length} salon(s)\n`);

  const micrositeTemplate = loadPrompt("microsite_generator.md");

  // Load existing data to preserve work done before any crash
  let existingEmails: GeneratedEmail[] = [];
  try {
    existingEmails = JSON.parse(readFileSync(EMAILS_OUT, "utf8")) as GeneratedEmail[];
  } catch { /* file may not exist yet */ }

  let existingMicrosites: MicrositeContent[] = [];
  try {
    existingMicrosites = JSON.parse(readFileSync(MICROSITES_OUT, "utf8")) as MicrositeContent[];
  } catch { /* file may not exist yet */ }

  const existingIds = new Set(existingEmails.map((e) => e.salon_id));
  const emails: GeneratedEmail[] = [...existingEmails];
  const microsites: MicrositeContent[] = [...existingMicrosites];
  let bannedWarnCount = 0;
  let skipped = 0;

  for (let idx = 0; idx < salons.length; idx++) {
    const salon = salons[idx];

    // Skip already-generated salons (unless --only targets this one specifically)
    if (!onlyId && existingIds.has(salon.id)) {
      console.log(`→ ${salon.id} (skipped — already generated)`);
      skipped++;
      continue;
    }

    console.log(`→ ${salon.id} (${salon.name})`);
    try {
      // 1. Generate email via agent loop (with tool-use)
      console.log(`  📧 email (agent loop)`);
      const email = await generateEmailAgent(salon);

      // Replace existing entry or append
      const existingEmailIdx = emails.findIndex((e) => e.salon_id === salon.id);
      if (existingEmailIdx >= 0) emails[existingEmailIdx] = email;
      else emails.push(email);

      // Post-agent verification
      const postHits = checkBanned(`${email.subject}\n${email.body}`);
      if (postHits.length) {
        bannedWarnCount++;
        console.log(`    ⚠ post-check: ${postHits.length} banned-phrase hit(s) survived:`);
        for (const h of postHits) {
          console.log(`      "${h.phrase}" → ${h.context}`);
        }
      } else {
        console.log(`    ✓ email clean — no banned phrases`);
      }

      // Brief pause before microsite call to respect rate limits
      await new Promise((r) => setTimeout(r, 2000));

      // 2. Generate microsite via single-shot call
      console.log(`  🌐 microsite (single-shot)`);
      const microsite = await generateMicrosite(salon, micrositeTemplate);

      const existingMsIdx = microsites.findIndex((m) => m.salon_id === salon.id);
      if (existingMsIdx >= 0) microsites[existingMsIdx] = microsite;
      else microsites.push(microsite);
      console.log(`    ✓ microsite generated`);

      // Write incrementally so a crash doesn't lose work
      writeFileSync(EMAILS_OUT, JSON.stringify(emails, null, 2) + "\n");
      writeFileSync(MICROSITES_OUT, JSON.stringify(microsites, null, 2) + "\n");
    } catch (err) {
      console.error(`  ✗ failed: ${(err as Error).message}`);
      throw err;
    }

    // Brief pause between salons to respect rate limits
    if (idx < salons.length - 1) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  const generated = salons.length - skipped;
  console.log(`\n✓ ${generated} generated, ${skipped} skipped (already done)`);
  console.log(`  ${emails.length} emails  → ${EMAILS_OUT}`);
  console.log(`  ${microsites.length} microsites → ${MICROSITES_OUT}`);
  if (bannedWarnCount) {
    console.log(`  ⚠ ${bannedWarnCount} email(s) still have banned-phrase warnings after agent revision`);
  } else {
    console.log(`  ✓ all emails passed banned-phrase checks`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
