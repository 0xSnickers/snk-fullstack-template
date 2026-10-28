<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { localeLabels, locales } from '@/core/i18n/locales';
import { colorModes, themeNames } from '@/core/theme/theme';
import { getNextValue } from '@/core/utils/cycle';
import AppButton from '@/components/ui/AppButton.vue';
import { usePreferencesStore } from '@/stores/preferencesStore';

/** 语言 / 主题色 / 深浅色切换。 */
const { t } = useI18n();
const { locale, theme, colorMode } = storeToRefs(usePreferencesStore());
</script>

<template>
  <view class="app-controls">
    <AppButton
      variant="outline"
      size="sm"
      :aria-label="t('settings.language')"
      @click="locale = getNextValue(locales, locale)"
    >
      {{ localeLabels[locale] }}
    </AppButton>
    <AppButton
      variant="outline"
      size="sm"
      :aria-label="t('settings.theme')"
      @click="theme = getNextValue(themeNames, theme)"
    >
      {{ t(`settings.themeNames.${theme}`) }}
    </AppButton>
    <AppButton
      variant="outline"
      size="sm"
      :aria-label="t('settings.colorMode')"
      @click="colorMode = getNextValue(colorModes, colorMode)"
    >
      {{ t(`settings.colorModeNames.${colorMode}`) }}
    </AppButton>
  </view>
</template>

<style scoped>
.app-controls {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
