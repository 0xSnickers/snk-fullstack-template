import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/generated/design_tokens.g.dart';
import '../../l10n/app_localizations.dart';
import '../preferences/preferences_controller.dart';
import 'app_button.dart';

T _next<T>(List<T> values, T current) => values[(values.indexOf(current) + 1) % values.length];

const _localeLabels = {'zh-CN': '中文', 'en-US': 'English'};

/// 语言 / 主题色 / 深浅色切换。
class AppControls extends ConsumerWidget {
  const AppControls({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final prefs = ref.watch(preferencesProvider);
    final controller = ref.read(preferencesProvider.notifier);

    final themeName = switch (prefs.brand) {
      AppBrandTheme.blue => l10n.settingsThemeNamesBlue,
      AppBrandTheme.violet => l10n.settingsThemeNamesViolet,
      AppBrandTheme.emerald => l10n.settingsThemeNamesEmerald,
    };
    final modeName = switch (prefs.themeMode) {
      ThemeMode.light => l10n.settingsColorModeNamesLight,
      ThemeMode.dark => l10n.settingsColorModeNamesDark,
      ThemeMode.system => l10n.settingsColorModeNamesSystem,
    };

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        Semantics(
          label: l10n.settingsLanguage,
          child: AppButton(
            label: _localeLabels[prefs.localeTag] ?? prefs.localeTag,
            variant: AppButtonVariant.outline,
            size: AppButtonSize.small,
            onPressed: () => controller.setLocale(_next(supportedLocaleTags, prefs.localeTag)),
          ),
        ),
        Semantics(
          label: l10n.settingsTheme,
          child: AppButton(
            label: themeName,
            variant: AppButtonVariant.outline,
            size: AppButtonSize.small,
            onPressed: () => controller.setBrand(_next(AppBrandTheme.values, prefs.brand)),
          ),
        ),
        Semantics(
          label: l10n.settingsColorMode,
          child: AppButton(
            label: modeName,
            variant: AppButtonVariant.outline,
            size: AppButtonSize.small,
            onPressed: () => controller.setThemeMode(
              _next(const [ThemeMode.light, ThemeMode.dark, ThemeMode.system], prefs.themeMode),
            ),
          ),
        ),
      ],
    );
  }
}
