import { createTelemetryProxy } from '@/core/telemetry/telemetry';

/**
 * 应用唯一的遥测入口。业务代码只调用 `telemetry.track / captureError / ...`。
 * 默认是空实现。接入 Sentry / PostHog（如 snk-telemetry-react-native、@sentry/react-native）时，
 * 在 src/app/_layout.tsx 初始化 SDK 后调用 telemetry.setImplementation(...)，业务代码无需改动。
 * 注意：带原生代码的 SDK 需要 development build，Expo Go 中不可用。
 */
export const telemetry = createTelemetryProxy();
