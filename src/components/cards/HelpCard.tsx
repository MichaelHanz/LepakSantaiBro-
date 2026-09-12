import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../../theme';

interface Props {
  examples: string[];
  onPick?: (example: string) => void;
}

export function HelpCard({ examples, onPick }: Props) {
  return (
    <View style={styles.wrap}>
      {examples.map((example) => (
        <Pressable
          key={example}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          onPress={onPick ? () => onPick(example) : undefined}
        >
          <Text style={styles.chipText}>{example}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipPressed: {
    backgroundColor: colors.mint,
    borderColor: colors.teal,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
  },
});
