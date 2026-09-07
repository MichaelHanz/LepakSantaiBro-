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
          style={styles.chip}
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
    gap: 7,
    marginTop: 10,
  },
  chip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
});
