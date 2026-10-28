import { usePreferencesStore } from '@/stores/preferencesStore';
import '@/i18n';

// 测试统一使用中文文案
beforeEach(() => {
  usePreferencesStore.setState({ locale: 'zh-CN' });
});
