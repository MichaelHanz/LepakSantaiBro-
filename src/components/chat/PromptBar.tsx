import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii } from '../../theme';

interface Props {
  onSend: (prompt: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function PromptBar({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue('');
    onSend(trimmed);
  };

  return (
    <View style={styles.bar}>
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        placeholder={placeholder ?? 'Ask the mediator anything…'}
        placeholderTextColor={colors.muted}
        style={styles.input}
        editable={!disabled}
        multiline
        returnKeyType="send"
        blurOnSubmit
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        style={[styles.send, (disabled || !value.trim()) && styles.sendDisabled]}
        onPress={submit}
      >
        <Ionicons name="arrow-up" size={18} color={colors.onInk} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: colors.cream,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: colors.ink,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: colors.line,
  },
});
