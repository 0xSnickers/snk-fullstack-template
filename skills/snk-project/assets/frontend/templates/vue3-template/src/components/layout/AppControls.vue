<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Languages, Monitor, Moon, Palette, Sun } from '@lucide/vue';
import { localeLabels, locales } from '@/core/i18n/locales';
import { colorModes, themeNames } from '@/core/theme/theme';
import { getNextValue } from '@/core/utils/cycle';
import Button from '@/components/ui/Button.vue';
import { useAppPreferences } from '@/composables/useAppPreferences';

const { t } = useI18n();
const { locale, theme, colorMode, changeLocale, changeTheme, changeColorMode } =
  useAppPreferences();

const modeIcon = computed(() => ({ light: Sun, dark: Moon, system: Monitor })[colorMode.value]);
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      :aria-label="t('settings.language')"
      @click="changeLocale(getNextValue(locales, locale))"
    >
      <Languages />
      {{ localeLabels[locale] }}
    </Button>
    <Button
      variant="outline"
      size="sm"
      :aria-label="t('settings.theme')"
      @click="changeTheme(getNextValue(themeNames, theme))"
    >
      <Palette class="text-primary" />
      {{ t(`settings.themeNames.${theme}`) }}
    </Button>
    <Button
      variant="outline"
      size="sm"
      :aria-label="t('settings.colorMode')"
      @click="changeColorMode(getNextValue(colorModes, colorMode))"
    >
      <component :is="modeIcon" />
      {{ t(`settings.colorModeNames.${colorMode}`) }}
    </Button>
  </div>
</template>
