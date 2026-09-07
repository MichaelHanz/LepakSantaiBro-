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
        <Ionicons name="lock-closed" size={14} color={colors.teal} />
        <Text style={styles.header}>GROUP SAFE LIMIT</Text>
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

      <Text style={styles.footnote}>
        Minimum across {submitted}/{memberCount} private submissions. Nobody sees whose numbers set
        the floor.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.mint,
    borderRadius: radii.md,
    padding: 14,
    marginTop: 10,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  header: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: colors.teal,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(15,118,110,0.25)',
    marginHorizontal: 12,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    color: colors.teal,
    marginTop: 2,
    fontWeight: '600',
  },
  footnote: {
    fontSize: 11,
    lineHeight: 15,
    color: '#3d6a5f',
  },
});
