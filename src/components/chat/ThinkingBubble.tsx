import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function ThinkingBubble() {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <MaterialCommunityIcons name="scale-balance" size={15} color={colors.mint} />
      </View>
      <Text style={styles.text}>Routing to a tool…</Text>
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
    borderRadius: 10,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13.5,
    fontStyle: 'italic',
    color: colors.muted,
  },
});
