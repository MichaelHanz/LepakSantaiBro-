import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

export function ThinkingBubble() {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>M</Text>
      </View>
      <Text style={styles.text}>Thinking…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.onInk,
    fontSize: 13,
    fontWeight: '700',
  },
  text: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.muted,
  },
});
