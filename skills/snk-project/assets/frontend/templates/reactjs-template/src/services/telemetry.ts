import { createTelemetryProxy } from '@/core/telemetry/telemetry';
import { env } from '@/config/env';

/**
 * 应用唯一的遥测入口。业务代码只调用 `telemetry.track / captureError / ...`。
 * 默认是空实现；VITE_TELEMETRY_ENABLED=true 时按需加载 snk-telemetry（Sentry + PostHog），
 * 未启用时 SDK 不会进入首屏包。替换为其他 SDK 只需要修改 initTelemetry。
 */
export const telemetry = createTelemetryProxy();

export async function initTelemetry(): Promise<void> {
  if (!env.telemetry.enabled) return;

  try {
    const { createReactTelemetry } = await import('snk-telemetry-reactjs');
    const client = createReactTelemetry({
      appName: env.appName,
      environment: env.appEnv,
      release: env.appRelease,
      enabled: true,
      sentry: env.telemetry.sentry,
      posthog: env.telemetry.posthog,
      onAdapterError(error) {
        if (env.isDev) console.warn('[telemetry] adapter failed', error);
      },
    });
    client.init();
    telemetry.setImplementation({
      ...client,
      identify: (user) => client.identify({ ...user, email: user.email ?? undefined }),
    });
  } catch (error) {
    if (env.isDev) console.warn('[telemetry] init failed', error);
  }
}
