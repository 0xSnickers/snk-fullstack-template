import { createTelemetryProxy } from '@/core/telemetry/telemetry';

/**
 * 应用唯一的遥测入口（客户端）。业务代码只调用 `telemetry.track / captureError / ...`。
 * 默认是空实现。接入 Sentry / PostHog 时：
 *   1. 安装对应 SDK（推荐 @sentry/nextjs 官方集成）；
 *   2. 在 src/providers/AppProviders.tsx 初始化后调用 telemetry.setImplementation(...)。
 * 业务代码不需要任何改动。
 */
export const telemetry = createTelemetryProxy();
