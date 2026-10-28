import { useId } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useAppTheme } from '@/theme/useAppTheme';

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
}

/** 表单字段：label + 输入框 + 错误提示，统一无障碍属性。 */
export function TextField({ label, error, style, ...props }: TextFieldProps) {
  const { colors } = useAppTheme();
  const id = useId();

  return (
    <View style={styles.field}>
      <Text nativeID={id} style={[styles.label, { color: colors.foreground }]}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        aria-labelledby={id}
        aria-invalid={Boolean(error)}
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          {
            color: colors.foreground,
            backgroundColor: colors.background,
            borderColor: error ? colors.destructive : colors.input,
          },
          style,
        ]}
        {...props}
      />
      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500' },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, fontSize: 15 },
  error: { fontSize: 13 },
});
