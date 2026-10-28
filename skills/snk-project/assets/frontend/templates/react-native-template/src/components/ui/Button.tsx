import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/theme/useAppTheme';

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'default' | 'sm' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** 与 Web 模板 Button 同一套变体命名（default / secondary / outline / ghost / destructive）。 */
export function Button({
  title,
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  icon,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useAppTheme();
  const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
    default: { bg: colors.primary, fg: colors.primaryForeground, border: colors.primary },
    secondary: { bg: colors.secondary, fg: colors.secondaryForeground, border: colors.secondary },
    outline: { bg: colors.background, fg: colors.foreground, border: colors.input },
    ghost: { bg: 'transparent', fg: colors.foreground, border: 'transparent' },
    destructive: {
      bg: colors.destructive,
      fg: colors.destructiveForeground,
      border: colors.destructive,
    },
  };
  const { bg, fg, border } = palette[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizes[size],
        { backgroundColor: bg, borderColor: border },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : icon}
      <Text style={[styles.text, { color: fg }, size === 'sm' && styles.textSm]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { fontSize: 15, fontWeight: '600' },
  textSm: { fontSize: 13 },
});

const sizes = StyleSheet.create({
  default: { minHeight: 44, paddingHorizontal: 16 },
  sm: { minHeight: 34, paddingHorizontal: 12 },
  lg: { minHeight: 50, paddingHorizontal: 24 },
});
