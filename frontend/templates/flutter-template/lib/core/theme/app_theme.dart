import 'package:flutter/material.dart';

import '../generated/design_tokens.g.dart';

export '../generated/design_tokens.g.dart' show AppBrandTheme, AppRadius, AppSpacing, AppFontSize;

/// 语义色扩展：组件通过 `context.colors.mutedForeground` 读取，与 Web 的 tokens.css 同源。
class AppColors extends ThemeExtension<AppColors> {
  const AppColors(this.tokens);

  final AppColorTokens tokens;

  @override
  AppColors copyWith({AppColorTokens? tokens}) => AppColors(tokens ?? this.tokens);

  @override
  AppColors lerp(ThemeExtension<AppColors>? other, double t) =>
      other is AppColors && t >= 0.5 ? other : this;
}

extension AppThemeContext on BuildContext {
  AppColorTokens get colors => Theme.of(this).extension<AppColors>()!.tokens;
}

AppColorTokens _withBrand(AppColorTokens base, BrandColors brand) => AppColorTokens(
      background: base.background,
      foreground: base.foreground,
      surface: base.surface,
      card: base.card,
      cardForeground: base.cardForeground,
      popover: base.popover,
      popoverForeground: base.popoverForeground,
      primary: brand.primary,
      primaryForeground: base.primaryForeground,
      secondary: brand.secondary,
      secondaryForeground: base.secondaryForeground,
      muted: base.muted,
      mutedForeground: base.mutedForeground,
      accent: base.accent,
      accentForeground: base.accentForeground,
      destructive: base.destructive,
      destructiveForeground: base.destructiveForeground,
      border: base.border,
      input: base.input,
      ring: brand.primary,
    );

/// 由设计 Token + 品牌色生成 Material 主题。只配置 ColorScheme，组件样式在 shared/widgets 中统一实现。
ThemeData buildAppTheme({required AppBrandTheme brand, required Brightness brightness}) {
  final base = brightness == Brightness.dark ? AppColorTokens.dark : AppColorTokens.light;
  final colors = _withBrand(base, brandThemes[brand]!);

  final scheme = ColorScheme(
    brightness: brightness,
    primary: colors.primary,
    onPrimary: colors.primaryForeground,
    secondary: colors.secondary,
    onSecondary: colors.secondaryForeground,
    error: colors.destructive,
    onError: colors.destructiveForeground,
    surface: colors.background,
    onSurface: colors.foreground,
    outline: colors.border,
  );

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: scheme,
    scaffoldBackgroundColor: colors.surface,
    extensions: [AppColors(colors)],
  );
}
