import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { createInitialState, type TripState } from './tripState';
import { loadTripState, saveTripState } from '../lib/storage';
import { nextMessageId, runAgentTurn } from '../lib/agent/runAgent';
import { HELP_EXAMPLES, runTool } from '../lib/agent/tools';
import type { ChatMessage } from '../lib/agent/types';

const GREETING: ChatMessage = {
  id: 'agent-greeting',
  role: 'agent',
  text: 'I mediate the money and the pace so nobody has to negotiate out loud. Tell me what is happening.',
  card: { kind: 'help', examples: HELP_EXAMPLES },
};

export interface TripAgent {
  state: TripState;
  messages: ChatMessage[];
  thinking: boolean;
  hydrated: boolean;
  send: (prompt: string) => Promise<void>;
  submitConstraints: (input: {
    max_daily_budget: number;
    social_battery_hours: number;
    pace_preference: 'pacesetter' | 'spectator';
  }) => Promise<void>;
}

export function useTripAgent(): TripAgent {
  const [state, setState] = useState<TripState>(createInitialState);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [thinking, setThinking] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const hydratedRef = useRef(false);
  const busyRef = useRef(false);

  // Hydration is the single authoritative transition from initial to restored
  // state: nothing may act on (or overwrite) the ledger until it lands.
  useEffect(() => {
    let active = true;
    loadTripState().then((restored) => {
      if (!active) return;
      stateRef.current = restored;
      hydratedRef.current = true;
      setState(restored);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  /** One agent turn at a time, so no completion writes over a stale snapshot. */
  const claimTurn = useCallback((): boolean => {
    if (!hydratedRef.current || busyRef.current) return false;
    busyRef.current = true;
    return true;
  }, []);

  useEffect(() => {
    if (hydrated) void saveTripState(state);
  }, [hydrated, state]);

  const dispatchPrompt = useCallback(async (prompt: string) => {
    setThinking(true);
    setMessages((prev) => [
      ...prev,
      { id: nextMessageId('user'), role: 'user', text: prompt },
    ]);
    try {
      const turn = await runAgentTurn(stateRef.current, prompt);
      stateRef.current = turn.state;
      setState(turn.state);
      setMessages((prev) => [...prev, turn.message]);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId('agent'),
          role: 'agent',
          text: 'That one slipped past me. Try rephrasing, or type "help" for what I can do.',
        },
      ]);
    } finally {
      setThinking(false);
    }
  }, []);

  const send = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || !claimTurn()) return;
      void Haptics.selectionAsync();
      try {
        await dispatchPrompt(trimmed);
      } finally {
        busyRef.current = false;
      }
    },
    [claimTurn, dispatchPrompt],
  );

  // Constraints bypass the transcript echo: the raw numbers stay private and
  // only the aggregate reaches the conversation (SPEC.md 2.1).
  const submitConstraints = useCallback<TripAgent['submitConstraints']>(
    async (input) => {
      if (!claimTurn()) return;
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const outcome = runTool(stateRef.current, {
          tool: 'set_my_constraints',
          args: input,
          confidence: 1,
        });
        stateRef.current = outcome.state;
        setState(outcome.state);
        setMessages((prev) => [
          ...prev,
          { id: nextMessageId('user'), role: 'user', text: 'Submitted my constraints privately.' },
          {
            id: nextMessageId('agent'),
            role: 'agent',
            text: outcome.fallbackText,
            card: outcome.card,
            tool: outcome.tool,
            source: 'keyword',
          },
        ]);
      } finally {
        busyRef.current = false;
      }
    },
    [claimTurn],
  );

  return { state, messages, thinking, hydrated, send, submitConstraints };
}
