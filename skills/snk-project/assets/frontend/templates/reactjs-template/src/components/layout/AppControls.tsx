import { Languages, Monitor, Moon, Palette, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { localeLabels, locales } from '@/core/i18n/locales';
import { colorModes, themeNames } from '@/core/theme/theme';
import { getNextValue } from '@/core/utils/cycle';
import { Button } from '@/components/ui/button';
import { useAppPreferences } from '@/providers/appPreferencesContext';

const colorModeIcons = { light: Sun, dark: Moon, system: Monitor } as const;

/** 语言 / 主题色 / 深浅色切换。 */
export function AppControls() {
  const { t } = useTranslation();
  const { locale, theme, colorMode, changeLocale, changeTheme, changeColorMode } =
    useAppPreferences();
  const ModeIcon = colorModeIcons[colorMode];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={t('settings.language')}
        onClick={() => changeLocale(getNextValue(locales, locale))}
      >
        <Languages />
        {localeLabels[locale]}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={t('settings.theme')}
        onClick={() => changeTheme(getNextValue(themeNames, theme))}
      >
        <Palette className="text-primary" />
        {t(`settings.themeNames.${theme}`)}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={t('settings.colorMode')}
        onClick={() => changeColorMode(getNextValue(colorModes, colorMode))}
      >
        <ModeIcon />
        {t(`settings.colorModeNames.${colorMode}`)}
      </Button>
    </div>
  );
}
