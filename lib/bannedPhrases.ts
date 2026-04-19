export const BANNED_PHRASES: string[] = [
  "hey there",
  "hope this finds you well",
  "amazing",
  "incredible",
  "game-changing",
  "game changing",
  "leverage",
  "synergy",
  "circle back",
  "touch base",
  "excited to connect",
  "quick call",
  "hop on a call",
  "jump on a call",
  "just wanted to reach out",
];

export type BannedHit = {
  phrase: string;
  context: string;
};

export function checkBanned(text: string): BannedHit[] {
  const lower = text.toLowerCase();
  const hits: BannedHit[] = [];
  for (const phrase of BANNED_PHRASES) {
    const idx = lower.indexOf(phrase);
    if (idx !== -1) {
      const start = Math.max(0, idx - 20);
      const end = Math.min(text.length, idx + phrase.length + 20);
      hits.push({ phrase, context: text.slice(start, end).trim() });
    }
  }
  if (text.includes("!")) {
    hits.push({ phrase: "!", context: "exclamation point found" });
  }
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text)) {
    hits.push({ phrase: "emoji", context: "emoji found" });
  }
  return hits;
}
