import type { Intent } from './types';

const AMOUNT_PATTERN = /(?:rm|myr|\$)?\s*(\d+(?:\.\d{1,2})?)/i;

function extractAmount(prompt: string): number | undefined {
  const match = prompt.match(AMOUNT_PATTERN);
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

function extractMember(prompt: string): string | undefined {
  const match = prompt.match(
    /(?:eject|reroute|extract|rescue|pull\s+out)\s+(?:for\s+)?([a-z][a-z'-]*)/i,
  );
  const name = match?.[1];
  if (!name) return undefined;
  const skip = ['me', 'myself', 'someone', 'somebody', 'a', 'the', 'us'];
  return skip.includes(name.toLowerCase()) ? 'me' : name;
}

/**
 * "log RM 20 rogue spend for Aina" — the owner of a personal charge. Matched
 * against the original casing so "for coffee" stays a description, not a name.
 */
function extractRogueOwner(prompt: string): string | undefined {
  const match = prompt.match(/\b(?:for|by|on behalf of)\s+(me|myself|[A-Z][a-z'-]+)\b/);
  const name = match?.[1];
  if (!name) return undefined;
  return /^(me|myself)$/i.test(name) ? 'me' : name;
}

function extractDay(prompt: string): 'today' | 'tomorrow' | undefined {
  if (/\btomorrow\b/.test(prompt)) return 'tomorrow';
  if (/\b(today|tonight)\b/.test(prompt)) return 'today';
  return undefined;
}

function extractDescription(prompt: string): string | undefined {
  const match = prompt.match(/\bfor\s+([a-z][\w\s'-]{1,40})$/i);
  return match?.[1]?.trim();
}

/**
 * Deterministic fallback parser so the demo works offline with no API key.
 * Intent parsing only — never the ledger or eject math (SPEC.md 3).
 */
export function parseIntentWithKeywords(prompt: string): Intent {
  const text = prompt.toLowerCase().trim();
  const amount = extractAmount(text);

  if (/\b(help|what can you do|commands)\b/.test(text)) {
    return { tool: 'help', args: {}, confidence: 0.9 };
  }

  if (/\b(eject|reroute|extract|rescue|needs? (a )?break|tap out)\b/.test(text)) {
    return { tool: 'find_ejection_route', args: { member: extractMember(text) ?? 'me' }, confidence: 0.85 };
  }

  if (/\b(safe limit|ceiling|group limit|threshold|how much can we spend)\b/.test(text)) {
    return { tool: 'get_group_safe_limit', args: {}, confidence: 0.85 };
  }

  if (/\b(set|update|change)\b/.test(text) && /\b(budget|battery|pace|constraint)\b/.test(text)) {
    const batteryMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/);
    const pace: Intent['args']['pace_preference'] | undefined = /pacesetter/.test(text)
      ? 'pacesetter'
      : /spectator/.test(text)
        ? 'spectator'
        : undefined;
    const isBudget = /budget/.test(text);
    return {
      tool: 'set_my_constraints',
      args: {
        max_daily_budget: isBudget ? amount : undefined,
        social_battery_hours: batteryMatch ? Number(batteryMatch[1]) : undefined,
        pace_preference: pace,
      },
      confidence: 0.8,
    };
  }

  if (/\b(rogue|personal|my own|solo|myself)\b/.test(text) && amount !== undefined) {
    return {
      tool: 'add_rogue_spend',
      args: {
        amount,
        member: extractMember(text) ?? extractRogueOwner(prompt) ?? 'me',
        description: extractDescription(prompt),
      },
      confidence: 0.8,
    };
  }

  if (amount !== undefined && /\b(add|spend|paid|pay|expense|charge|split|cost)\b/.test(text)) {
    return {
      tool: 'propose_communal_expense',
      args: { amount, description: extractDescription(prompt) },
      confidence: 0.8,
    };
  }

  if (/\b(plan|itinerary|schedule|ghost block|anchor|tomorrow|today)\b/.test(text)) {
    return { tool: 'plan_day', args: { day: extractDay(text) }, confidence: 0.75 };
  }

  if (/\b(ledger|spend|burn|totals?|owe|balance|money)\b/.test(text)) {
    return { tool: 'get_ledger_status', args: {}, confidence: 0.7 };
  }

  return { tool: 'help', args: {}, confidence: 0.2 };
}
