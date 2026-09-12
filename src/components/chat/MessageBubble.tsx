import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ChatMessage } from '../../lib/agent/types';
import { ResultCardView } from '../cards/ResultCardView';
import { colors, radii } from '../../theme';

interface Props {
  message: ChatMessage;
  onPickExample?: (example: string) => void;
}

const TOOL_LABEL: Record<string, string> = {
  get_group_safe_limit: 'Checking safe limit',
  propose_communal_expense: 'Reviewing expense',
  add_rogue_spend: 'Logging personal spend',
  find_ejection_route: 'Finding safe route out',
  plan_day: 'Building the day plan',
  set_my_constraints: 'Saving your constraints',
  get_ledger_status: 'Reading the ledger',
  help: 'Showing options',
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
        <Text style={styles.avatarText}>M</Text>
      </View>
      <View style={styles.agentBody}>
        {message.tool ? (
          <View style={styles.toolRow}>
            <Ionicons name="cog" size={11} color={colors.muted} />
            <Text style={styles.toolText}>{TOOL_LABEL[message.tool] ?? message.tool}</Text>
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
    maxWidth: '80%',
    backgroundColor: colors.teal,
    borderRadius: 18,
    borderBottomRightRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  userText: {
    color: colors.onInk,
    fontSize: 15,
    lineHeight: 21,
  },
  agentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  avatarText: {
    color: colors.onInk,
    fontSize: 13,
    fontWeight: '700',
  },
  agentBody: {
    flex: 1,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  toolText: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: 'italic',
  },
  agentText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
});
