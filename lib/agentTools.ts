import type { ToolDef } from "./geminiClient.js";
import { checkBanned } from "./bannedPhrases.js";

/* ─── Tool definitions (Gemini function-calling schema) ─── */

export const AGENT_TOOLS: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "check_banned_phrases",
      description:
        "Scans the provided text for MaRe banned phrases, exclamation points, and emoji. " +
        "Returns a list of violations and whether the text is clean.",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The text to scan for banned phrases.",
          },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "count_sentences",
      description:
        "Counts the number of sentences in the email body (excluding the signature line '— Rebecca'). " +
        "Returns the count and whether it equals exactly 3.",
      parameters: {
        type: "object",
        properties: {
          body: {
            type: "string",
            description: "The email body text to count sentences in.",
          },
        },
        required: ["body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "submit_email",
      description:
        "Finalizes and submits the email. Only call this when both check_banned_phrases and " +
        "count_sentences have passed. This is the terminal action.",
      parameters: {
        type: "object",
        properties: {
          subject: {
            type: "string",
            description: "The email subject line.",
          },
          body: {
            type: "string",
            description: "The full email body including the '— Rebecca' signature.",
          },
        },
        required: ["subject", "body"],
      },
    },
  },
];

/* ─── Tool implementations ─── */

export type CheckBannedResult = {
  violations: Array<{ phrase: string; context: string }>;
  clean: boolean;
};

export function toolCheckBannedPhrases(text: string): CheckBannedResult {
  const hits = checkBanned(text);
  return {
    violations: hits.map((h) => ({ phrase: h.phrase, context: h.context })),
    clean: hits.length === 0,
  };
}

export type CountSentencesResult = {
  count: number;
  ok: boolean;
};

export function toolCountSentences(body: string): CountSentencesResult {
  // Strip signature line before counting
  const stripped = body
    .split("\n")
    .filter((line) => !line.trim().startsWith("— Rebecca") && !line.trim().startsWith("- Rebecca"))
    .join(" ")
    .trim();

  // Split on sentence-ending punctuation followed by whitespace or end-of-string
  const sentences = stripped
    .split(/(?<=[.?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return { count: sentences.length, ok: sentences.length === 3 };
}

export type SubmitEmailResult = {
  approved: true;
  subject: string;
  body: string;
};

export function toolSubmitEmail(subject: string, body: string): SubmitEmailResult {
  return { approved: true, subject, body };
}

/* ─── Tool dispatcher (used by agentLoop's executeTool callback) ─── */

export function executeAgentTool(
  name: string,
  args: Record<string, unknown>,
): unknown {
  switch (name) {
    case "check_banned_phrases":
      return toolCheckBannedPhrases(args.text as string);
    case "count_sentences":
      return toolCountSentences(args.body as string);
    case "submit_email":
      return toolSubmitEmail(args.subject as string, args.body as string);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
