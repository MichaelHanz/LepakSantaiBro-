import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ChatMessage } from '../../lib/agent/types';
import { ResultCardView } from '../cards/ResultCardView';
import { colors, radii } from '../../theme';

interface Props {
  message: ChatMessage;
  onPickExample?: (example: string) => void;
}

const TOOL_LABEL: Record<string, string> = {
  get_group_safe_limit: 'calculate_group_safe_limit()',
  propose_communal_expense: 'propose_communal_expense()',
  add_rogue_spend: 'add_rogue_spend()',
  find_ejection_route: 'find_ejection_route()',
  plan_day: 'build_day_plan()',
  set_my_constraints: 'submit_constraints()',
  get_ledger_status: 'read_ledger()',
  help: 'help()',
};

export function MessageBubble({ message, onPickExample }: Props) {
  if (message.role === 'user') {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.agentRow}>
      <View style={styles.avatar}>
        <MaterialCommunityIcons name="scale-balance" size={15} color={colors.mint} />
      </View>
      <View style={styles.agentBody}>
        {message.tool ? (
          <View style={styles.toolRow}>
            <MaterialCommunityIcons name="function-variant" size={12} color={colors.muted} />
            <Text style={styles.toolText}>{TOOL_LABEL[message.tool] ?? message.tool}</Text>
            <Text style={styles.sourceText}>
              {message.source === 'keyword' ? 'offline parser' : message.source}
            </Text>
          </View>
        ) : null}
        <Text style={styles.agentText}>{message.text}</Text>
        {message.card ? (
          <ResultCardView card={message.card} onPickExample={onPickExample} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '86%',
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    borderBottomRightRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  userText: {
    color: colors.onInk,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  agentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  agentBody: {
    flex: 1,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  toolText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.2,
  },
  sourceText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.teal,
    textTransform: 'uppercase',
  },
  agentText: {
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.ink,
    fontWeight: '500',
  },
});
