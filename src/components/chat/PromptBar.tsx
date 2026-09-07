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
        placeholderTextColor="#a5b0aa"
        style={styles.input}
        editable={!disabled}
        multiline
        returnKeyType="send"
        blurOnSubmit
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send prompt"
        style={[styles.send, (disabled || !value.trim()) && styles.sendDisabled]}
        onPress={submit}
      >
        <Ionicons name="arrow-up" size={19} color={colors.onInk} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14.5,
    color: colors.ink,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: '#9bb3ad',
  },
});
