import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PacePreference } from '../../types';
import { colors, radii } from '../../theme';

export interface ConstraintsInput {
  max_daily_budget: number;
  social_battery_hours: number;
  pace_preference: PacePreference;
}

interface Props {
  visible: boolean;
  submittedCount: number;
  memberCount: number;
  onClose: () => void;
  onSubmit: (input: ConstraintsInput) => void;
}

/**
 * SPEC.md 2.1 — constraints are collected blind: this sheet only ever shows the
 * current user's own numbers, never anyone else's.
 */
export function BlindConstraintsSheet({
  visible,
  submittedCount,
  memberCount,
  onClose,
  onSubmit,
}: Props) {
  const [budget, setBudget] = useState('');
  const [battery, setBattery] = useState('');
  const [pace, setPace] = useState<PacePreference>('spectator');

  const submit = () => {
    const budgetValue = Number(budget);
    const batteryValue = Number(battery);
    if (!Number.isFinite(budgetValue) || budgetValue <= 0) return;
    if (!Number.isFinite(batteryValue) || batteryValue <= 0) return;
    onSubmit({
      max_daily_budget: budgetValue,
      social_battery_hours: batteryValue,
      pace_preference: pace,
    });
    setBudget('');
    setBattery('');
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.badge}>
            <Ionicons name="lock-closed" size={15} color={colors.teal} />
            <Text style={styles.badgeText}>PRIVATE · {submittedCount}/{memberCount} SUBMITTED</Text>
          </View>

          <Text style={styles.title}>Only you see these.</Text>
          <Text style={styles.copy}>
            The group only ever sees the aggregated Group Safe Limit — never who set the floor.
          </Text>

          <Text style={styles.label}>MAX DAILY BUDGET (RM)</Text>
          <TextInput
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
            placeholder="120"
            placeholderTextColor="#a5b0aa"
            style={styles.input}
          />

          <Text style={styles.label}>SOCIAL BATTERY (HOURS)</Text>
          <TextInput
            value={battery}
            onChangeText={setBattery}
            keyboardType="numeric"
            placeholder="5"
            placeholderTextColor="#a5b0aa"
            style={styles.input}
          />

          <Text style={styles.label}>PACE</Text>
          <View style={styles.paceRow}>
            {(['pacesetter', 'spectator'] as PacePreference[]).map((option) => (
              <Pressable
                key={option}
                style={[styles.paceOption, pace === option && styles.paceOptionActive]}
                onPress={() => setPace(option)}
              >
                <Text style={[styles.paceText, pace === option && styles.paceTextActive]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.submit} onPress={submit}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.onInk} />
            <Text style={styles.submitText}>Submit privately</Text>
          </Pressable>
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,38,34,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 20,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.mint,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.9,
    color: colors.teal,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
    color: colors.ink,
    marginTop: 12,
  },
  copy: {
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.muted,
    marginTop: 6,
    marginBottom: 12,
  },
  label: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: colors.muted,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  paceRow: {
    flexDirection: 'row',
    gap: 9,
  },
  paceOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  paceOptionActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  paceText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'capitalize',
  },
  paceTextActive: {
    color: colors.onInk,
  },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.teal,
    borderRadius: radii.md,
    paddingVertical: 15,
    marginTop: 20,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.onInk,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.muted,
  },
});
