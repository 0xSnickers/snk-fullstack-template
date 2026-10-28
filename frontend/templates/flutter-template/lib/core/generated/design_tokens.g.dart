// 由 packages/core 同步生成，请勿直接修改。修改真源后运行 `npm run sync:core`。
// ignore_for_file: type=lint

import 'package:flutter/painting.dart';

/// 支持的语言（与 Web / RN / uni-app 模板一致）。
const supportedLocaleTags = <String>['zh-CN', 'en-US'];

/// 语义色，对应 tokens.css / tokens.ts。
class AppColorTokens {
  const AppColorTokens({
    required this.background,
    required this.foreground,
    required this.surface,
    required this.card,
    required this.cardForeground,
    required this.popover,
    required this.popoverForeground,
    required this.primary,
    required this.primaryForeground,
    required this.secondary,
    required this.secondaryForeground,
    required this.muted,
    required this.mutedForeground,
    required this.accent,
    required this.accentForeground,
    required this.destructive,
    required this.destructiveForeground,
    required this.border,
    required this.input,
    required this.ring,
  });

  final Color background;
  final Color foreground;
  final Color surface;
  final Color card;
  final Color cardForeground;
  final Color popover;
  final Color popoverForeground;
  final Color primary;
  final Color primaryForeground;
  final Color secondary;
  final Color secondaryForeground;
  final Color muted;
  final Color mutedForeground;
  final Color accent;
  final Color accentForeground;
  final Color destructive;
  final Color destructiveForeground;
  final Color border;
  final Color input;
  final Color ring;

  static const light = AppColorTokens(
    background: Color(0xFFFFFFFF),
    foreground: Color(0xFF020617),
    surface: Color(0xFFF8FAFC),
    card: Color(0xFFFFFFFF),
    cardForeground: Color(0xFF020617),
    popover: Color(0xFFFFFFFF),
    popoverForeground: Color(0xFF020617),
    primary: Color(0xFF2563EB),
    primaryForeground: Color(0xFFFFFFFF),
    secondary: Color(0xFF0F766E),
    secondaryForeground: Color(0xFFFFFFFF),
    muted: Color(0xFFF1F5F9),
    mutedForeground: Color(0xFF64748B),
    accent: Color(0xFFF1F5F9),
    accentForeground: Color(0xFF0F172A),
    destructive: Color(0xFFDC2626),
    destructiveForeground: Color(0xFFFFFFFF),
    border: Color(0xFFE2E8F0),
    input: Color(0xFFE2E8F0),
    ring: Color(0xFF2563EB),
  );

  static const dark = AppColorTokens(
    background: Color(0xFF020617),
    foreground: Color(0xFFF8FAFC),
    surface: Color(0xFF0B1220),
    card: Color(0xFF0F172A),
    cardForeground: Color(0xFFF8FAFC),
    popover: Color(0xFF0F172A),
    popoverForeground: Color(0xFFF8FAFC),
    primary: Color(0xFF2563EB),
    primaryForeground: Color(0xFFFFFFFF),
    secondary: Color(0xFF0F766E),
    secondaryForeground: Color(0xFFFFFFFF),
    muted: Color(0xFF1E293B),
    mutedForeground: Color(0xFF94A3B8),
    accent: Color(0xFF1E293B),
    accentForeground: Color(0xFFF8FAFC),
    destructive: Color(0xFFEF4444),
    destructiveForeground: Color(0xFFFFFFFF),
    border: Color(0xFF1E293B),
    input: Color(0xFF334155),
    ring: Color(0xFF2563EB),
  );
}

/// 品牌主题色，对应 theme.ts 中的 themes。
enum AppBrandTheme { blue, violet, emerald }

class BrandColors {
  const BrandColors({required this.primary, required this.secondary});

  final Color primary;
  final Color secondary;
}

const brandThemes = <AppBrandTheme, BrandColors>{
  AppBrandTheme.blue: BrandColors(primary: Color(0xFF2563EB), secondary: Color(0xFF0F766E)),
  AppBrandTheme.violet: BrandColors(primary: Color(0xFF7C3AED), secondary: Color(0xFF0891B2)),
  AppBrandTheme.emerald: BrandColors(primary: Color(0xFF059669), secondary: Color(0xFF4F46E5)),
};

abstract final class AppRadius {
  static const double sm = 4;
  static const double md = 6;
  static const double lg = 8;
  static const double xl = 12;
}

abstract final class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;
}

abstract final class AppFontSize {
  static const double xs = 12;
  static const double sm = 14;
  static const double md = 16;
  static const double lg = 18;
  static const double xl = 24;
}
