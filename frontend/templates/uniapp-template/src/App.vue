<script setup lang="ts">
import { onError, onHide, onLaunch, onShow } from '@dcloudio/uni-app';
import { setupAppPreferences } from '@/composables/useAppPreferences';
import { restoreSession, setupAuth } from '@/features/auth';
import { setAppFocused } from '@/services/queryClient';
import { telemetry } from '@/services/telemetry';

onLaunch(() => {
  setupAppPreferences();
  setupAuth();
  void restoreSession();
});

onShow(() => setAppFocused(true));
onHide(() => setAppFocused(false));
onError((error) => telemetry.captureError(error, { source: 'uni_app_error' }));
</script>

<style>
/* 全局样式。颜色使用 PageContainer 注入的 CSS 变量（来自 src/core/theme/tokens.ts）。 */
page {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #f8fafc;
}
</style>
