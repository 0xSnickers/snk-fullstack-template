'use client';

import { useTransition } from 'react';
import { Languages, Monitor, Moon, Palette, Sun } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { localeLabels, locales } from '@/core/i18n/locales';
import { colorModes, themeNames } from '@/core/theme/theme';
import { getNextValue } from '@/core/utils/cycle';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAppPreferences } from '@/providers/AppPreferencesProvider';

const colorModeIcons = { light: Sun, dark: Moon, system: Monitor } as const;

/** 语言 / 主题色 / 深浅色切换。语言切换通过 URL 前缀完成。 */
export function AppControls() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { theme, colorMode, changeTheme, changeColorMode } = useAppPreferences();
  const ModeIcon = colorModeIcons[colorMode];

  function switchLocale() {
    const query = Object.fromEntries(searchParams.entries());
    startTransition(() => {
      router.replace({ pathname, query }, { locale: getNextValue(locales, locale) });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={t('language')}
        disabled={isPending}
        onClick={switchLocale}
      >
        <Languages />
        {localeLabels[locale]}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={t('theme')}
        onClick={() => changeTheme(getNextValue(themeNames, theme))}
      >
        <Palette className="text-primary" />
        {t(`themeNames.${theme}`)}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={t('colorMode')}
        onClick={() => changeColorMode(getNextValue(colorModes, colorMode))}
      >
        <ModeIcon />
        {t(`colorModeNames.${colorMode}`)}
      </Button>
    </div>
  );
}
