import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GroupSafeLimit } from '../../types';
import { colors, radii } from '../../theme';

interface Props {
  safeLimit: GroupSafeLimit;
  memberCount: number;
  submitted: number;
}

export function SafeLimitCard({ safeLimit, memberCount, submitted }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={16} color={colors.teal} />
        </View>
        <Text style={styles.header}>Group Safe Limit</Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.value}>RM {safeLimit.daily_budget_ceiling}</Text>
          <Text style={styles.label}>per person / day</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metric}>
          <Text style={styles.value}>{safeLimit.max_group_hours}h</Text>
          <Text style={styles.label}>max group time</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={14} color={colors.muted} />
        <Text style={styles.footnote}>
          Minimum across {submitted}/{memberCount} private submissions. Nobody sees whose numbers set the floor.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.mint,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
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
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderRadius: radii.md,
    padding: 16,
  },
  metric: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.line,
    marginHorizontal: 16,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.teal,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  footnote: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
  },
});
