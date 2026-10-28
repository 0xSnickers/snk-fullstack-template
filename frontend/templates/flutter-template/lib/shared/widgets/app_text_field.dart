import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// 表单字段：label + 输入框 + 错误提示。
class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    required this.label,
    required this.controller,
    this.error,
    this.obscureText = false,
    this.keyboardType,
    this.autofillHints,
    this.textInputAction,
  });

  final String label;
  final TextEditingController controller;
  final String? error;
  final bool obscureText;
  final TextInputType? keyboardType;
  final Iterable<String>? autofillHints;
  final TextInputAction? textInputAction;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    OutlineInputBorder border(Color color) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: color),
        );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: AppFontSize.sm, fontWeight: FontWeight.w500, color: colors.foreground),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          autofillHints: autofillHints,
          textInputAction: textInputAction,
          style: TextStyle(color: colors.foreground),
          decoration: InputDecoration(
            hintText: label,
            hintStyle: TextStyle(color: colors.mutedForeground),
            isDense: true,
            filled: true,
            fillColor: colors.background,
            contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 12),
            enabledBorder: border(error == null ? colors.input : colors.destructive),
            focusedBorder: border(error == null ? colors.ring : colors.destructive),
            errorText: error,
            errorStyle: TextStyle(color: colors.destructive),
            errorBorder: border(colors.destructive),
            focusedErrorBorder: border(colors.destructive),
          ),
        ),
      ],
    );
  }
}
