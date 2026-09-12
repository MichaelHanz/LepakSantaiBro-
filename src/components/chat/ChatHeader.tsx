import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GroupSafeLimit, Trip } from '../../types';
import { colors, radii, spacing } from '../../theme';

interface Props {
  trip: Trip;
  safeLimit: GroupSafeLimit;
  onOpenConstraints?: () => void;
}

export function ChatHeader({ trip, safeLimit, onOpenConstraints }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        <Text style={styles.brand}>
          Lepak<Text style={styles.brandAccent}>Santai</Text>Bro
        </Text>
        <Text style={styles.tripName}>{trip.name}, {trip.city}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.safePill}>
          <Text style={styles.safeValue}>
            RM {safeLimit.daily_budget_ceiling}/day
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Update my private constraints"
          style={styles.iconButton}
          onPress={onOpenConstraints}
        >
          <Ionicons name="shield-checkmark" size={18} color={colors.onInk} />
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  titleBlock: {
    flex: 1,
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.ink,
  },
  brandAccent: {
    color: colors.teal,
  },
  tripName: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  safePill: {
    backgroundColor: colors.mint,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  safeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.teal,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
