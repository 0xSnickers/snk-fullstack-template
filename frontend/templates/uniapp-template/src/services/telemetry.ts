import { createTelemetryProxy } from '@/core/telemetry/telemetry';

/**
 * 应用唯一的遥测入口。业务代码只调用 `telemetry.track / captureError / ...`。
 * 默认是空实现。接入统计 / 监控 SDK（如 uni 统计、Sentry 等）时，
 * 在 App.vue 的 onLaunch 中初始化后调用 telemetry.setImplementation(...)，业务代码无需改动。
 */
export const telemetry = createTelemetryProxy();
