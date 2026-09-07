import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GroupSafeLimit, Trip } from '../../types';
import { colors, radii } from '../../theme';

interface Props {
  trip: Trip;
  safeLimit: GroupSafeLimit;
  onOpenConstraints?: () => void;
}

export function ChatHeader({ trip, safeLimit, onOpenConstraints }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>{trip.name.toUpperCase()} · {trip.city.toUpperCase()}</Text>
        <Text style={styles.brand}>
          Santai <Text style={styles.brandAccent}>Lepak</Text> Bro
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.safePill}>
          <Text style={styles.safeLabel}>SAFE LIMIT</Text>
          <Text style={styles.safeValue}>
            RM {safeLimit.daily_budget_ceiling} · {safeLimit.max_group_hours}h
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Update my private constraints"
          style={styles.iconButton}
          onPress={onOpenConstraints}
        >
          <Ionicons name="lock-closed-outline" size={17} color={colors.onInk} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  titleBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.muted,
  },
  brand: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.7,
    color: colors.ink,
    marginTop: 2,
  },
  brandAccent: {
    color: colors.teal,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  safePill: {
    backgroundColor: colors.mint,
    borderRadius: radii.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  safeLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9,
    color: colors.teal,
  },
  safeValue: {
    fontSize: 12.5,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
