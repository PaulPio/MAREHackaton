import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROMPTS_DIR = resolve(__dirname, "..", "prompts");

export function loadPrompt(name: string): string {
  return readFileSync(resolve(PROMPTS_DIR, name), "utf8");
}

export function renderPrompt(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!(key in vars)) {
      throw new Error(`Missing template variable: ${key}`);
    }
    return vars[key];
  });
}
