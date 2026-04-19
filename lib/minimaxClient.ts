const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const DEFAULT_MODEL = "gemini-2.0-flash";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatOptions = {
  temperature?: number;
  maxTokens?: number;
};

export async function chatJSON<T>(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<{ parsed: T; raw: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Copy .env.example to .env and fill it in.");
  }
  const baseUrl = process.env.GEMINI_BASE_URL ?? DEFAULT_BASE_URL;
  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 1024,
  };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "<no body>");
    throw new Error(`Gemini HTTP ${res.status}: ${errText}`);
  }

  const payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`Gemini response missing content: ${JSON.stringify(payload).slice(0, 500)}`);
  }

  const parsed = parseLooseJSON(content) as T;
  return { parsed, raw: content };
}

function parseLooseJSON(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      return JSON.parse(trimmed.slice(first, last + 1));
    }
    throw new Error(`Model did not return valid JSON. First 300 chars:\n${trimmed.slice(0, 300)}`);
  }
}
