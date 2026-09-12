import { useState, useRef } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PacePreference } from '../../types';
import { colors, radii } from '../../theme';
import { linkTelegramAccount } from '../../lib/telegram';

export interface ConstraintsInput {
  max_daily_budget: number;
  social_battery_hours: number;
  pace_preference: PacePreference;
}

interface Props {
  visible: boolean;
  submittedCount: number;
  memberCount: number;
  disabled?: boolean;
  onClose: () => void;
  onSubmit: (input: ConstraintsInput) => void;
}

/**
 * SPEC.md 2.1 — constraints are collected blind: this sheet only ever shows the
 * current user's own numbers, never anyone else's.
 */
function SpringButton({ onPress, style, children }: { onPress: () => void; style?: any; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;
  
  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };
  
  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4, // Bouncy Apple feel
      tension: 100,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={onPress}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function BlindConstraintsSheet({
  visible,
  submittedCount,
  memberCount,
  disabled,
  onClose,
  onSubmit,
}: Props) {
  const [budget, setBudget] = useState('');
  const [battery, setBattery] = useState('');
  const [pace, setPace] = useState<PacePreference>('spectator');

  const linkTelegram = () => {
    // Assuming a mock user ID for the demo if none is passed in props
    linkTelegramAccount('demo_user_id');
  };

  const submit = () => {
    if (disabled) return;
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
              <SpringButton
                key={option}
                style={[styles.paceOption, pace === option && styles.paceOptionActive]}
                onPress={() => setPace(option)}
              >
                <Text style={[styles.paceText, pace === option && styles.paceTextActive]}>
                  {option}
                </Text>
              </SpringButton>
            ))}
          </View>

          <SpringButton style={styles.submit} onPress={submit}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.onInk} />
            <Text style={styles.submitText}>Submit privately</Text>
          </SpringButton>
          <SpringButton style={styles.telegramLink} onPress={linkTelegram}>
            <Ionicons name="paper-plane" size={16} color={colors.teal} />
            <Text style={styles.telegramText}>Link Telegram for live updates</Text>
          </SpringButton>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: colors.line,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(30px) saturate(180%)' as any } : {}),
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.line,
    marginBottom: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.mint,
    borderRadius: radii.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.teal,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    color: colors.ink,
    marginTop: 16,
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
    marginTop: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.muted,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  paceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  paceOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: radii.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  paceOptionActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  paceText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.inkSoft,
    textTransform: 'capitalize',
  },
  paceTextActive: {
    color: colors.onInk,
  },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.teal,
    borderRadius: radii.md,
    paddingVertical: 16,
    marginTop: 24,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.onInk,
    letterSpacing: -0.3,
  },
  telegramLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 181, 0.3)',
    borderRadius: radii.md,
    backgroundColor: 'rgba(0, 240, 181, 0.05)',
  },
  telegramText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.teal,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.muted,
  },
});
