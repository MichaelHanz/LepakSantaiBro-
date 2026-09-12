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
            name={blocked ? 'close-circle' : 'checkmark-circle'}
            size={20}
            color={blocked ? colors.coral : colors.teal}
          />
          <View style={styles.verdictBody}>
            <Text style={[styles.verdictTitle, blocked && styles.verdictTitleBlocked]}>
              {blocked ? 'Expense Blocked' : 'Expense Approved'}
            </Text>
            <Text style={styles.verdictReason}>
              {blocked ? lastProposal.reason : `${money(lastProposal.per_member_share)} added per person`}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.ledgerContent}>
        <View style={styles.row}>
          <View style={styles.iconContainerMint}>
            <Ionicons name="people" size={18} color={colors.teal} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>Communal burn</Text>
            <Text style={styles.rowMeta}>{money(perMember)} per person</Text>
          </View>
          <Text style={styles.rowValue}>{money(ledger.communal_burn_rate)}</Text>
        </View>

        <View style={styles.hairline} />

        <View style={styles.row}>
          <View style={styles.iconContainerCoral}>
            <Ionicons name="person" size={18} color={colors.coral} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>
              {rogueOwner ? `${rogueOwner.display_name}'s rogue spend` : 'Rogue spend'}
            </Text>
            <Text style={styles.rowMeta}>Personal, never pooled</Text>
          </View>
          <Text style={styles.rowValue}>{money(rogueTotal)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footnote}>
          Ceiling {money(safeLimit.daily_budget_ceiling)} per person per day.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 12,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  verdict: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  verdictApproved: {
    backgroundColor: colors.mint,
  },
  verdictBlocked: {
    backgroundColor: colors.coralSoft,
  },
  verdictBody: {
    flex: 1,
  },
  verdictTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.teal,
  },
  verdictTitleBlocked: {
    color: colors.coral,
  },
  verdictReason: {
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 2,
  },
  ledgerContent: {
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainerMint: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerCoral: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  rowMeta: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  hairline: {
    height: 1,
    backgroundColor: colors.line,
    marginLeft: 52,
  },
  footer: {
    backgroundColor: colors.cream,
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footnote: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
});
