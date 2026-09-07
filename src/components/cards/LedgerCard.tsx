import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CommunalExpenseResult, GroupSafeLimit, Ledger, Member } from '../../types';
import { totalRogueSpend } from '../../lib/engines/ledger';
import { colors, radii } from '../../theme';

interface Props {
  ledger: Ledger;
  memberCount: number;
  safeLimit: GroupSafeLimit;
  lastProposal: CommunalExpenseResult | null;
  rogueOwner: Member | null;
}

const money = (value: number) => `RM ${value.toFixed(2).replace(/\.00$/, '')}`;

export function LedgerCard({ ledger, memberCount, safeLimit, lastProposal, rogueOwner }: Props) {
  const perMember = memberCount > 0 ? ledger.communal_burn_rate / memberCount : 0;
  const rogueTotal = rogueOwner
    ? (ledger.rogue_spend[rogueOwner.user_id] ?? 0)
    : totalRogueSpend(ledger);
  const blocked = lastProposal?.approved === false;

  return (
    <View style={styles.card}>
      {lastProposal ? (
        <View style={[styles.verdict, blocked ? styles.verdictBlocked : styles.verdictApproved]}>
          <Ionicons
            name={blocked ? 'hand-left' : 'checkmark-circle'}
            size={15}
            color={blocked ? colors.coral : colors.teal}
          />
          <Text style={[styles.verdictText, blocked && styles.verdictTextBlocked]}>
            {blocked
              ? `BLOCKED · ${lastProposal.reason}`
              : `APPROVED · ${money(lastProposal.per_member_share)} each`}
          </Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.mint }]}>
          <Ionicons name="people" size={16} color={colors.teal} />
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>Communal burn</Text>
          <Text style={styles.rowMeta}>{money(perMember)} per person</Text>
        </View>
        <Text style={styles.rowValue}>{money(ledger.communal_burn_rate)}</Text>
      </View>

      <View style={styles.hairline} />

      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.coralSoft }]}>
          <Ionicons name="person" size={16} color={colors.coral} />
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>
            {rogueOwner ? `${rogueOwner.display_name} · rogue spend` : 'Rogue spend'}
          </Text>
          <Text style={styles.rowMeta}>Personal · never pooled</Text>
        </View>
        <Text style={[styles.rowValue, styles.rogueValue]}>{money(rogueTotal)}</Text>
      </View>

      <Text style={styles.footnote}>
        Ceiling {money(safeLimit.daily_budget_ceiling)} per person per day.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginTop: 10,
    gap: 10,
  },
  verdict: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 11,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  verdictApproved: {
    backgroundColor: colors.mint,
  },
  verdictBlocked: {
    backgroundColor: colors.coralSoft,
  },
  verdictText: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: colors.teal,
    textTransform: 'uppercase',
  },
  verdictTextBlocked: {
    color: colors.coral,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.ink,
  },
  rowMeta: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  rogueValue: {
    color: colors.coral,
  },
  hairline: {
    height: 1,
    backgroundColor: colors.line,
  },
  footnote: {
    fontSize: 11,
    color: colors.muted,
  },
});
