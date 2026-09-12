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
        <Text style={styles.header}>Day {plan.day}</Text>
        <Text style={styles.subHeader}>
          {plan.anchor_nodes.length} anchors, {plan.ghost_blocks.length} ghost blocks
        </Text>
      </View>

      {plan.anchor_nodes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="moon-outline" size={24} color={colors.muted} />
          <Text style={styles.emptyText}>
            No fusion points today. The lowest social battery cannot cover one, so the entire day stays ghosted.
          </Text>
        </View>
      ) : null}

      <View style={styles.timeline}>
        {plan.anchor_nodes.map((anchor, i) => (
          <View key={`${anchor.time}-${anchor.activity}`} style={styles.anchorNode}>
            <View style={styles.timeCol}>
              <Text style={styles.time}>{anchor.time}</Text>
            </View>
            <View style={styles.nodeLine}>
              <View style={styles.dotTeal} />
              {i < plan.anchor_nodes.length - 1 && <View style={styles.lineSegment} />}
            </View>
            <View style={styles.contentCol}>
              <Text style={styles.activity}>{anchor.activity}</Text>
              <Text style={styles.location}>{anchor.location}</Text>
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>Fusion point · RM {anchor.cost_per_member}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {splits.length > 0 && (
        <View style={styles.splitsSection}>
          <Text style={styles.sectionTitle}>Ghost Blocks</Text>
          {splits.map(({ block, pacesetters, spectators }) => (
            <View key={`${block.start}-${block.end}`} style={styles.ghostBlock}>
              <View style={styles.ghostHeader}>
                <Ionicons name="time-outline" size={14} color={colors.muted} />
                <Text style={styles.ghostTime}>{block.start} — {block.end}</Text>
              </View>
              
              <View style={styles.branches}>
                <View style={styles.branch}>
                  <View style={styles.branchHeader}>
                    <Text style={styles.groupName}>Pacesetters</Text>
                    <Text style={styles.members}>{pacesetters.map((m) => m.display_name).join(', ') || 'Nobody'}</Text>
                  </View>
                  <View style={styles.branchCard}>
                    <Text style={styles.branchActivity}>{block.pacesetter_activity.type}</Text>
                    <Text style={styles.branchLocation}>{block.pacesetter_activity.location}</Text>
                    <Text style={styles.branchCost}>RM {block.pacesetter_activity.estimated_cost}</Text>
                  </View>
                </View>
                
                <View style={styles.branch}>
                  <View style={styles.branchHeader}>
                    <Text style={styles.groupName}>Spectators</Text>
                    <Text style={styles.members}>{spectators.map((m) => m.display_name).join(', ') || 'Nobody'}</Text>
                  </View>
                  <View style={[styles.branchCard, styles.branchCardAlt]}>
                    <Text style={styles.branchActivity}>{block.spectator_activity.type}</Text>
                    <Text style={styles.branchLocation}>{block.spectator_activity.location}</Text>
                    <Text style={styles.branchCost}>RM {block.spectator_activity.estimated_cost}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
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
  },
  headerRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.cream,
  },
  header: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  subHeader: {
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 2,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  timeline: {
    padding: 16,
  },
  anchorNode: {
    flexDirection: 'row',
  },
  timeCol: {
    width: 50,
    paddingTop: 2,
  },
  time: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  nodeLine: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  dotTeal: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.teal,
    borderWidth: 2,
    borderColor: colors.surface,
    zIndex: 2,
    marginTop: 4,
  },
  lineSegment: {
    width: 2,
    flex: 1,
    backgroundColor: colors.line,
    marginTop: -4,
    marginBottom: -4,
    zIndex: 1,
  },
  contentCol: {
    flex: 1,
    paddingBottom: 24,
  },
  activity: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  location: {
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: 2,
  },
  metaBadge: {
    backgroundColor: colors.mint,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.teal,
  },
  splitsSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: '#FAFAFA',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 16,
  },
  ghostBlock: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 12,
  },
  ghostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  ghostTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkSoft,
  },
  branches: {
    gap: 16,
  },
  branch: {
    gap: 8,
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  groupName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  members: {
    fontSize: 13,
    color: colors.muted,
  },
  branchCard: {
    backgroundColor: colors.cream,
    padding: 12,
    borderRadius: radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
  },
  branchCardAlt: {
    borderLeftColor: colors.coral,
  },
  branchActivity: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  branchLocation: {
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 2,
  },
  branchCost: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 6,
  },
});
