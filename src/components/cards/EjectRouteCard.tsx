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
        <Ionicons name="exit" size={15} color={colors.coral} />
        <Text style={styles.header}>
          EJECT · {member.display_name.toUpperCase()} · {fallback ? 'CHEAPEST FALLBACK' : 'WEIGHTED SCORE'}
        </Text>
      </View>

      <View style={styles.destination}>
        <View style={styles.destinationBody}>
          <Text style={styles.name}>{route.node.name}</Text>
          <Text style={styles.meta}>
            {route.node.travel_time_minutes} min · {money(route.node.estimated_cost)} ·{' '}
            {route.node.distance_km} km
          </Text>
        </View>
        <Text style={styles.score}>{fallback ? '—' : route.score.toFixed(2)}</Text>
      </View>

      <Text style={styles.reason}>{route.reason}</Text>

      <View style={styles.budgetRow}>
        <Text style={styles.budgetLabel}>REMAINING BUDGET</Text>
        <Text style={styles.budgetValue}>{money(remainingBudget)}</Text>
      </View>

      {route.considered.length > 1 ? (
        <View style={styles.runnersUp}>
          {route.considered.slice(1, 3).map((entry) => (
            <View key={entry.node.id} style={styles.runnerRow}>
              <Text style={styles.runnerName} numberOfLines={1}>
                {entry.node.name}
              </Text>
              <Text style={styles.runnerScore}>{entry.score.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {anchorImpact ? (
        <View
          style={[
            styles.anchor,
            anchorImpact.can_make_anchor ? styles.anchorOk : styles.anchorLate,
          ]}
        >
          <Ionicons
            name={anchorImpact.can_make_anchor ? 'people' : 'alarm'}
            size={14}
            color={anchorImpact.can_make_anchor ? colors.teal : colors.coral}
          />
          <Text
            style={[
              styles.anchorText,
              anchorImpact.can_make_anchor ? styles.anchorTextOk : styles.anchorTextLate,
            ]}
          >
            {anchorImpact.can_make_anchor
              ? `Rejoins at the ${anchorImpact.anchor.time} ${anchorImpact.anchor.activity.toLowerCase()} fusion point.`
              : `Cannot make ${anchorImpact.anchor.time} — suggest moving the ${anchorImpact.anchor.activity.toLowerCase()} to ${anchorImpact.suggested_anchor_time}.`}
          </Text>
        </View>
      ) : null}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  header: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.coral,
    flex: 1,
  },
  destination: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderRadius: 13,
    padding: 12,
  },
  destinationBody: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  meta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  score: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.teal,
  },
  reason: {
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.muted,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.muted,
  },
  budgetValue: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.ink,
  },
  runnersUp: {
    gap: 5,
  },
  runnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  runnerName: {
    flex: 1,
    fontSize: 11.5,
    color: colors.muted,
  },
  runnerScore: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.muted,
  },
  anchor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 11,
    padding: 10,
  },
  anchorOk: {
    backgroundColor: colors.mint,
  },
  anchorLate: {
    backgroundColor: colors.coralSoft,
  },
  anchorText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '700',
  },
  anchorTextOk: {
    color: colors.teal,
  },
  anchorTextLate: {
    color: colors.coral,
  },
});
