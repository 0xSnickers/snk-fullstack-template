/**
 * 遥测（错误监控 + 行为分析）的统一接口。
 * 业务代码只依赖这个接口；具体实现（snk-telemetry / Sentry / PostHog / 自研）在模板的
 * src/services/telemetry.ts 中接入，替换实现不需要改业务代码。
 */
export type TelemetryProperties = Record<string, unknown>;

export interface TelemetryUser {
  id: string;
  email?: string | null;
  name?: string;
  role?: string;
}

export interface Telemetry {
  track(name: string, properties?: TelemetryProperties): void;
  pageView(path: string, properties?: TelemetryProperties): void;
  captureError(error: unknown, properties?: TelemetryProperties): void;
  identify(user: TelemetryUser): void;
  reset(): void;
  addBreadcrumb(message: string, properties?: TelemetryProperties): void;
}

/** 空实现：未开启遥测时使用，所有调用都是安全的空操作。 */
export const noopTelemetry: Telemetry = {
  track() {},
  pageView() {},
  captureError() {},
  identify() {},
  reset() {},
  addBreadcrumb() {},
};

/** 开发调试实现：把遥测事件打印到控制台。 */
export function createConsoleTelemetry(prefix = '[telemetry]'): Telemetry {
  return {
    track: (name, properties) => console.info(prefix, 'track', name, properties ?? {}),
    pageView: (path, properties) => console.info(prefix, 'pageView', path, properties ?? {}),
    captureError: (error, properties) => console.error(prefix, 'error', error, properties ?? {}),
    identify: (user) => console.info(prefix, 'identify', user),
    reset: () => console.info(prefix, 'reset'),
    addBreadcrumb: (message, properties) =>
      console.info(prefix, 'breadcrumb', message, properties ?? {}),
  };
}

/**
 * 可替换实现的遥测代理。
 * 模块加载时先导出代理（默认空实现），应用启动后再调用 `setImplementation` 接入真实 SDK，
 * 避免业务模块之间出现初始化顺序问题。
 */
export function createTelemetryProxy(initial: Telemetry = noopTelemetry) {
  let impl = initial;

  const safe =
    <TArgs extends unknown[]>(call: (target: Telemetry, ...args: TArgs) => void) =>
    (...args: TArgs) => {
      try {
        call(impl, ...args);
      } catch (error) {
        if (typeof console !== 'undefined') console.warn('[telemetry] call failed', error);
      }
    };

  const proxy: Telemetry & { setImplementation(next: Telemetry): void } = {
    track: safe((t, name: string, properties?: TelemetryProperties) => t.track(name, properties)),
    pageView: safe((t, path: string, properties?: TelemetryProperties) =>
      t.pageView(path, properties),
    ),
    captureError: safe((t, error: unknown, properties?: TelemetryProperties) =>
      t.captureError(error, properties),
    ),
    identify: safe((t, user: TelemetryUser) => t.identify(user)),
    reset: safe((t) => t.reset()),
    addBreadcrumb: safe((t, message: string, properties?: TelemetryProperties) =>
      t.addBreadcrumb(message, properties),
    ),
    setImplementation(next) {
      impl = next;
    },
  };

  return proxy;
}
