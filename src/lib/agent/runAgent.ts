import type { TripState } from '../../state/tripState';
import { parseIntentWithKeywords } from './keywordParser';
import { narrateResult, parseIntentWithLLM } from './llm';
import { runTool } from './tools';
import type { ChatMessage, IntentSource } from './types';

export interface AgentTurn {
  state: TripState;
  message: ChatMessage;
}

let counter = 0;
export function nextMessageId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

/**
 * The LLM only routes the prompt to a tool and phrases the answer; every number
 * in the reply comes from the deterministic engines (SPEC.md 3).
 */
export async function runAgentTurn(
  state: TripState,
  prompt: string,
  now: Date = new Date(),
): Promise<AgentTurn> {
  let source: IntentSource = 'keyword';
  let intent = parseIntentWithKeywords(prompt);

  const llmIntent = await parseIntentWithLLM(prompt).catch(() => null);
  if (llmIntent) {
    intent = llmIntent.intent;
    source = llmIntent.source;
  }

  const outcome = runTool(state, intent, now);
  const text = await narrateResult(outcome.facts, outcome.fallbackText).catch(
    () => outcome.fallbackText,
  );

  return {
    state: outcome.state,
    message: {
      id: nextMessageId('agent'),
      role: 'agent',
      text,
      card: outcome.card,
      tool: outcome.tool,
      source,
    },
  };
}
