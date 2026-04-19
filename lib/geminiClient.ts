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

/* ─── Agent loop: multi-turn tool-use conversation ─── */

export type ToolFunction = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type ToolDef = {
  type: "function";
  function: ToolFunction;
};

export type ToolCallResult = {
  name: string;
  arguments: Record<string, unknown>;
};

export type AgentMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "assistant"; content: string | null; tool_calls: ApiToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

type ApiToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type ApiChoice = {
  finish_reason: string;
  message: {
    role: string;
    content?: string | null;
    tool_calls?: ApiToolCall[];
  };
};

export type AgentLoopOptions = {
  temperature?: number;
  maxTokens?: number;
  maxIterations?: number;
  /** Called when the model requests a tool. Return the JSON-serialisable result. */
  executeTool: (name: string, args: Record<string, unknown>) => unknown | Promise<unknown>;
  /** If this tool is called, the loop stops and returns the result. */
  terminalTool?: string;
  /** Optional callback for logging. */
  onToolCall?: (name: string, args: Record<string, unknown>, result: unknown) => void;
};

export async function agentLoop(
  messages: AgentMessage[],
  tools: ToolDef[],
  options: AgentLoopOptions,
): Promise<{ finalContent: string | null; history: AgentMessage[]; terminated: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
  const baseUrl = process.env.GEMINI_BASE_URL ?? DEFAULT_BASE_URL;
  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const maxIter = options.maxIterations ?? 6;
  const history: AgentMessage[] = [...messages];

  for (let i = 0; i < maxIter; i++) {
    const body: Record<string, unknown> = {
      model,
      messages: history,
      tools,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 1500,
    };

    for (let attempt = 0; attempt <= 3; attempt++) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429 || res.status === 503) {
        if (attempt < 3) {
          const waitSec = [5, 15, 30][attempt] ?? 30;
          console.log(`    ⏳ rate-limited (HTTP ${res.status}) — waiting ${waitSec}s before retry…`);
          await new Promise((r) => setTimeout(r, waitSec * 1000));
          continue;
        }
        const errText = await res.text().catch(() => "<no body>");
        throw new Error(`Gemini HTTP ${res.status}: ${errText}`);
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "<no body>");
        throw new Error(`Gemini HTTP ${res.status}: ${errText}`);
      }

      const payload = (await res.json()) as { choices?: ApiChoice[] };
      const choice = payload.choices?.[0];
      if (!choice) throw new Error("Gemini returned no choices.");

      const msg = choice.message;

      // Case 1: model wants to call tool(s)
      if (choice.finish_reason === "tool_calls" || msg.tool_calls?.length) {
        const toolCalls = msg.tool_calls ?? [];

        // Push assistant message with tool_calls
        history.push({
          role: "assistant",
          content: msg.content ?? null,
          tool_calls: toolCalls,
        } as AgentMessage);

        for (const tc of toolCalls) {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(tc.function.arguments);
          } catch {
            args = {};
          }

          const result = await options.executeTool(tc.function.name, args);
          if (options.onToolCall) options.onToolCall(tc.function.name, args, result);

          history.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          });

          // Terminal tool → stop immediately
          if (options.terminalTool && tc.function.name === options.terminalTool) {
            return { finalContent: JSON.stringify(result), history, terminated: true };
          }
        }
        break; // exit retry loop, go to next iteration
      }

      // Case 2: model finished (stop)
      if (msg.content) {
        history.push({ role: "assistant", content: msg.content });
      }
      return { finalContent: msg.content ?? null, history, terminated: false };
    }
  }

  // Exhausted iterations
  return { finalContent: null, history, terminated: false };
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
