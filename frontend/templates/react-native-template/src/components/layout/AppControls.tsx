import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { localeLabels, locales } from '@/core/i18n/locales';
import { colorModes, themeNames } from '@/core/theme/theme';
import { getNextValue } from '@/core/utils/cycle';
import { Button } from '@/components/ui/Button';
import { usePreferencesStore } from '@/stores/preferencesStore';

/** 语言 / 主题色 / 深浅色切换。 */
export function AppControls() {
  const { t } = useTranslation();
  const { locale, theme, colorMode, setLocale, setTheme, setColorMode } = usePreferencesStore();

  return (
    <View style={styles.row}>
      <Button
        size="sm"
        variant="outline"
        accessibilityLabel={t('settings.language')}
        title={localeLabels[locale]}
        onPress={() => setLocale(getNextValue(locales, locale))}
      />
      <Button
        size="sm"
        variant="outline"
        accessibilityLabel={t('settings.theme')}
        title={t(`settings.themeNames.${theme}`)}
        onPress={() => setTheme(getNextValue(themeNames, theme))}
      />
      <Button
        size="sm"
        variant="outline"
        accessibilityLabel={t('settings.colorMode')}
        title={t(`settings.colorModeNames.${colorMode}`)}
        onPress={() => setColorMode(getNextValue(colorModes, colorMode))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
