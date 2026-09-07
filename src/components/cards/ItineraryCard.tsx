import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DayPlan } from '../../types';
import type { GhostBlockSplit } from '../../lib/engines/itinerary';
import { colors, radii } from '../../theme';

interface Props {
  plan: DayPlan;
  splits: GhostBlockSplit[];
}

export function ItineraryCard({ plan, splits }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="git-branch" size={15} color={colors.teal} />
        <Text style={styles.header}>
          DAY {plan.day} · {plan.anchor_nodes.length} ANCHORS · {plan.ghost_blocks.length} GHOST BLOCKS
        </Text>
      </View>

      {plan.anchor_nodes.length === 0 ? (
        <Text style={styles.anchorMeta}>
          No fusion points today — the lowest social battery cannot cover one, so the day stays
          fully ghosted.
        </Text>
      ) : null}

      {plan.anchor_nodes.map((anchor) => (
        <View key={`${anchor.time}-${anchor.activity}`} style={styles.anchorRow}>
          <Text style={styles.anchorTime}>{anchor.time}</Text>
          <View style={styles.anchorBody}>
            <Text style={styles.anchorTitle}>
              {anchor.activity} · {anchor.location}
            </Text>
            <Text style={styles.anchorMeta}>Fusion point · RM {anchor.cost_per_member} pp</Text>
          </View>
        </View>
      ))}

      {splits.map(({ block, pacesetters, spectators }) => (
        <View key={`${block.start}-${block.end}`} style={styles.ghost}>
          <Text style={styles.ghostTime}>
            {block.start} — {block.end}
          </Text>
          <View style={styles.branch}>
            <View style={[styles.branchDot, { backgroundColor: colors.lilac }]} />
            <View style={styles.branchBody}>
              <Text style={styles.branchLabel}>
                PACESETTERS · {pacesetters.map((m) => m.display_name).join(', ') || 'nobody'}
              </Text>
              <Text style={styles.branchTitle}>
                {block.pacesetter_activity.type} · {block.pacesetter_activity.location}
              </Text>
            </View>
            <Text style={styles.branchCost}>RM {block.pacesetter_activity.estimated_cost}</Text>
          </View>
          <View style={styles.branch}>
            <View style={[styles.branchDot, { backgroundColor: colors.coralSoft }]} />
            <View style={styles.branchBody}>
              <Text style={styles.branchLabel}>
                SPECTATORS · {spectators.map((m) => m.display_name).join(', ') || 'nobody'}
              </Text>
              <Text style={styles.branchTitle}>
                {block.spectator_activity.type} · {block.spectator_activity.location}
              </Text>
            </View>
            <Text style={styles.branchCost}>RM {block.spectator_activity.estimated_cost}</Text>
          </View>
        </View>
      ))}
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
    flex: 1,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.teal,
  },
  anchorRow: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
  },
  anchorTime: {
    width: 46,
    fontSize: 12,
    fontWeight: '900',
    color: colors.ink,
  },
  anchorBody: {
    flex: 1,
  },
  anchorTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  anchorMeta: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  ghost: {
    backgroundColor: colors.cream,
    borderRadius: 13,
    padding: 11,
    gap: 9,
  },
  ghostTime: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.muted,
  },
  branch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  branchDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  branchBody: {
    flex: 1,
  },
  branchLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: colors.muted,
  },
  branchTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 1,
  },
  branchCost: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.muted,
  },
});
