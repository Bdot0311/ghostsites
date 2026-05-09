import { env } from "./env";

const OPENROUTER_API_KEY = env.openrouterApiKey;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "moonshotai/kimi-latest";

export interface KimiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callKimi(
  messages: KimiMessage[],
  opts: { temperature?: number; max_tokens?: number; jsonMode?: boolean } = {},
): Promise<string> {
  const { temperature = 0.7, max_tokens = 4000, jsonMode = false } = opts;

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature,
    max_tokens,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://ghostsites.app",
      "X-Title": "GhostSites",
    },
    body: JSON.stringify(body),
  });

  const rawText = await res.text();

  if (!res.ok) {
    throw new Error(`OpenRouter HTTP ${res.status}: ${rawText.slice(0, 500)}`);
  }

  // Guard against HTML error pages
  if (rawText.trim().startsWith("<") || rawText.trim().startsWith("<!DOCTYPE")) {
    throw new Error(`OpenRouter returned HTML instead of JSON (HTTP ${res.status})`);
  }

  let parsed: { choices?: { message?: { content?: string } }[] };
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(`OpenRouter returned invalid JSON: ${rawText.slice(0, 200)}`);
  }

  const content = parsed.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned empty content");
  }

  return content;
}
