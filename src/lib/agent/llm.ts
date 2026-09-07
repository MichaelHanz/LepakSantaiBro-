import type { Intent, IntentSource, ToolName } from './types';

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GEMINI_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-2.0-flash';
const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL ?? 'llama-3.1-8b-instant';
const REQUEST_TIMEOUT_MS = 8000;

const TOOL_NAMES: ToolName[] = [
  'get_group_safe_limit',
  'propose_communal_expense',
  'add_rogue_spend',
  'find_ejection_route',
  'plan_day',
  'set_my_constraints',
  'get_ledger_status',
  'help',
];

const INTENT_SYSTEM_PROMPT = `You are the intent router for a group-trip mediator app.
Map the user's message to exactly one tool and its arguments. You never do arithmetic:
budgets, ledger totals and ejection scoring are computed by deterministic code.
Tools: ${TOOL_NAMES.join(', ')}.
Argument keys: amount (number), member (name or "me"), description (string),
max_daily_budget (number), social_battery_hours (number),
pace_preference ("pacesetter"|"spectator"), day ("today"|"tomorrow").
Numbers must be JSON numbers, never strings.
Reply with JSON only: {"tool": "...", "args": {...}}`;

export const llmAvailable = Boolean(GEMINI_KEY || GROQ_KEY);

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(system: string, user: string): Promise<string | null> {
  if (!GEMINI_KEY) return null;
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0.2 },
      }),
    },
  );
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return payload.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

async function callGroq(system: string, user: string): Promise<string | null> {
  if (!GROQ_KEY) return null;
  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return payload.choices?.[0]?.message?.content ?? null;
}

/** Gemini primary, Groq fallback (SPEC.md 3). Returns null when both are unusable. */
async function complete(
  system: string,
  user: string,
): Promise<{ text: string; source: IntentSource } | null> {
  for (const provider of [
    { source: 'gemini' as const, call: callGemini },
    { source: 'groq' as const, call: callGroq },
  ]) {
    try {
      const text = await provider.call(system, user);
      if (text) return { text, source: provider.source };
    } catch {
      // fall through to the next provider, then to the keyword parser
    }
  }
  return null;
}

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

const positiveNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;

const nonEmptyString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

/**
 * Model output is untrusted: a string "60" would turn later ledger additions
 * into string concatenation, so every argument is schema-checked and a
 * malformed one rejects the whole intent back to the keyword parser.
 */
function validateArgs(raw: Record<string, unknown>): Intent['args'] | null {
  const args: Intent['args'] = {};
  const numbers = ['amount', 'max_daily_budget', 'social_battery_hours'] as const;
  for (const key of numbers) {
    if (raw[key] === undefined || raw[key] === null) continue;
    const value = positiveNumber(raw[key]);
    if (value === null) return null;
    args[key] = value;
  }

  for (const key of ['member', 'description'] as const) {
    if (raw[key] === undefined || raw[key] === null) continue;
    const value = nonEmptyString(raw[key]);
    if (value === null) return null;
    args[key] = value;
  }

  if (raw.pace_preference !== undefined && raw.pace_preference !== null) {
    if (raw.pace_preference !== 'pacesetter' && raw.pace_preference !== 'spectator') return null;
    args.pace_preference = raw.pace_preference;
  }

  if (raw.day !== undefined && raw.day !== null) {
    if (raw.day !== 'today' && raw.day !== 'tomorrow') return null;
    args.day = raw.day;
  }

  return args;
}

function coerceIntent(raw: unknown): Intent | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as { tool?: unknown; args?: unknown };
  const tool = TOOL_NAMES.find((name) => name === record.tool);
  if (!tool) return null;
  const rawArgs =
    typeof record.args === 'object' && record.args !== null
      ? (record.args as Record<string, unknown>)
      : {};
  const args = validateArgs(rawArgs);
  if (!args) return null;
  return { tool, args, confidence: 0.95 };
}

export async function parseIntentWithLLM(
  prompt: string,
): Promise<{ intent: Intent; source: IntentSource } | null> {
  if (!llmAvailable) return null;
  const completion = await complete(INTENT_SYSTEM_PROMPT, prompt);
  if (!completion) return null;
  const intent = coerceIntent(extractJson(completion.text));
  return intent ? { intent, source: completion.source } : null;
}

/**
 * Narration only: the numbers are already computed deterministically and are
 * passed in as facts the model may rephrase but must not recalculate.
 */
export async function narrateResult(facts: string, fallback: string): Promise<string> {
  if (!llmAvailable) return fallback;
  const completion = await complete(
    `You narrate results for a group-trip mediator. Warm, dry, two sentences maximum.
Use only the numbers given; never invent or recompute figures.`,
    `Facts:\n${facts}\n\nDefault phrasing: ${fallback}`,
  );
  return completion?.text.trim() || fallback;
}
