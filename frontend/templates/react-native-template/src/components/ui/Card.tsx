import { StyleSheet, View, type ViewProps } from 'react-native';
import { useAppTheme } from '@/theme/useAppTheme';

export function Card({ style, ...props }: ViewProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 8, padding: 16 },
});
