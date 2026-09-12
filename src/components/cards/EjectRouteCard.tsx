import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AnchorImpact, EjectionRoute, Member } from '../../types';
import { colors, radii } from '../../theme';

interface Props {
  member: Member;
  route: EjectionRoute;
  remainingBudget: number;
  anchorImpact: AnchorImpact | null;
}

const money = (value: number) => `RM ${value.toFixed(2).replace(/\.00$/, '')}`;

export function EjectRouteCard({ member, route, remainingBudget, anchorImpact }: Props) {
  const fallback = route.outcome === 'fallback_cheapest';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Ionicons name="exit" size={16} color={colors.coral} />
        </View>
        <Text style={styles.header}>
          Eject Route for {member.display_name}
        </Text>
      </View>

      <View style={styles.destination}>
        <View style={styles.destinationBody}>
          <Text style={styles.name}>{route.node.name}</Text>
          <Text style={styles.meta}>
            {route.node.travel_time_minutes} mins away
          </Text>
        </View>
        <View style={styles.costBadge}>
          <Text style={styles.costText}>{money(route.node.estimated_cost)}</Text>
        </View>
      </View>

      <Text style={styles.reason}>{route.reason}</Text>

      <View style={styles.budgetSection}>
        <Text style={styles.budgetLabel}>Remaining daily budget</Text>
        <Text style={styles.budgetValue}>{money(remainingBudget)}</Text>
      </View>

      {anchorImpact ? (
        <View style={[styles.anchor, anchorImpact.can_make_anchor ? styles.anchorOk : styles.anchorLate]}>
          <Ionicons
            name={anchorImpact.can_make_anchor ? 'checkmark-circle' : 'warning'}
            size={18}
            color={anchorImpact.can_make_anchor ? colors.teal : colors.coral}
          />
          <Text style={[styles.anchorText, anchorImpact.can_make_anchor ? styles.anchorTextOk : styles.anchorTextLate]}>
            {anchorImpact.can_make_anchor
              ? `Can rejoin at the ${anchorImpact.anchor.time} ${anchorImpact.anchor.activity.toLowerCase()} fusion point.`
              : `Cannot make the ${anchorImpact.anchor.time} fusion point. Suggest moving it to ${anchorImpact.suggested_anchor_time}.`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.coralSoft,
    marginTop: 12,
    padding: 16,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    flex: 1,
  },
  destination: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 12,
  },
  destinationBody: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  meta: {
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: 4,
  },
  costBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  costText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coral,
  },
  reason: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
    marginBottom: 16,
  },
  budgetSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    marginBottom: 16,
  },
  budgetLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  anchor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radii.md,
  },
  anchorOk: {
    backgroundColor: colors.mint,
  },
  anchorLate: {
    backgroundColor: colors.coralSoft,
  },
  anchorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  anchorTextOk: {
    color: colors.teal,
  },
  anchorTextLate: {
    color: colors.coral,
  },
});
