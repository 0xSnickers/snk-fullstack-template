import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

enum AppButtonVariant { primary, secondary, outline, ghost, destructive }

enum AppButtonSize { normal, small }

/// 按钮：与 Web / RN / uni-app 模板同一套变体（primary / secondary / outline / ghost / destructive）。
class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.normal,
    this.loading = false,
    this.expand = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool loading;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final colors = context.colors;
    final (background, foreground, border) = switch (variant) {
      AppButtonVariant.primary => (colors.primary, colors.primaryForeground, colors.primary),
      AppButtonVariant.secondary => (colors.secondary, colors.secondaryForeground, colors.secondary),
      AppButtonVariant.outline => (colors.background, colors.foreground, colors.input),
      AppButtonVariant.ghost => (Colors.transparent, colors.foreground, Colors.transparent),
      AppButtonVariant.destructive => (
          colors.destructive,
          colors.destructiveForeground,
          colors.destructive,
        ),
    };
    final small = size == AppButtonSize.small;

    final button = TextButton(
      onPressed: loading ? null : onPressed,
      style: TextButton.styleFrom(
        backgroundColor: background,
        foregroundColor: foreground,
        disabledBackgroundColor: background,
        disabledForegroundColor: foreground,
        minimumSize: Size(0, small ? 34.0 : 44.0),
        padding: EdgeInsets.symmetric(horizontal: small ? AppSpacing.md : AppSpacing.lg),
        textStyle: TextStyle(fontSize: small ? AppFontSize.sm : 15.0, fontWeight: FontWeight.w600),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          side: BorderSide(color: border),
        ),
      ),
      child: Row(
        mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (loading) ...[
            SizedBox.square(
              dimension: 14,
              child: CircularProgressIndicator(strokeWidth: 2, color: foreground),
            ),
            const SizedBox(width: AppSpacing.sm),
          ],
          Text(label),
        ],
      ),
    );

    return Opacity(opacity: onPressed == null || loading ? 0.6 : 1, child: button);
  }
}
