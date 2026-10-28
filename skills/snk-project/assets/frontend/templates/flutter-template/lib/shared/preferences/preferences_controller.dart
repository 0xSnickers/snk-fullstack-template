import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/providers.dart';
import '../../core/generated/design_tokens.g.dart';

/// 应用级偏好：语言、品牌主题、深浅色。持久化到 SharedPreferences。
class Preferences {
  const Preferences({required this.localeTag, required this.brand, required this.themeMode});

  /// 与其他模板一致的语言代码：zh-CN / en-US。
  final String localeTag;
  final AppBrandTheme brand;
  final ThemeMode themeMode;

  Locale get locale => Locale(localeTag.split('-').first);

  Preferences copyWith({String? localeTag, AppBrandTheme? brand, ThemeMode? themeMode}) =>
      Preferences(
        localeTag: localeTag ?? this.localeTag,
        brand: brand ?? this.brand,
        themeMode: themeMode ?? this.themeMode,
      );
}

const _localeKey = 'app.locale';
const _themeKey = 'app.theme';
const _colorModeKey = 'app.color-mode';

/// 系统语言匹配到受支持的语言：精确匹配 > 语言前缀匹配 > 默认中文。
String matchLocaleTag(Locale locale) {
  final tag = locale.countryCode == null ? locale.languageCode : '${locale.languageCode}-${locale.countryCode}';
  if (supportedLocaleTags.contains(tag)) return tag;
  return supportedLocaleTags.firstWhere(
    (supported) => supported.split('-').first == locale.languageCode,
    orElse: () => supportedLocaleTags.first,
  );
}

class PreferencesController extends Notifier<Preferences> {
  @override
  Preferences build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    final savedLocale = prefs.getString(_localeKey);
    final savedTheme = prefs.getString(_themeKey);
    final savedMode = prefs.getString(_colorModeKey);

    return Preferences(
      localeTag: supportedLocaleTags.contains(savedLocale)
          ? savedLocale!
          : matchLocaleTag(WidgetsBinding.instance.platformDispatcher.locale),
      brand: AppBrandTheme.values.firstWhere(
        (brand) => brand.name == savedTheme,
        orElse: () => AppBrandTheme.blue,
      ),
      themeMode: ThemeMode.values.firstWhere(
        (mode) => mode.name == savedMode,
        orElse: () => ThemeMode.system,
      ),
    );
  }

  void setLocale(String tag) {
    state = state.copyWith(localeTag: tag);
    ref.read(sharedPreferencesProvider).setString(_localeKey, tag);
  }

  void setBrand(AppBrandTheme brand) {
    state = state.copyWith(brand: brand);
    ref.read(sharedPreferencesProvider).setString(_themeKey, brand.name);
  }

  void setThemeMode(ThemeMode mode) {
    state = state.copyWith(themeMode: mode);
    ref.read(sharedPreferencesProvider).setString(_colorModeKey, mode.name);
  }
}

final preferencesProvider = NotifierProvider<PreferencesController, Preferences>(
  PreferencesController.new,
);
