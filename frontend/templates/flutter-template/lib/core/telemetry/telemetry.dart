/// 遥测（错误监控 + 行为分析）统一接口，对应 core/telemetry/telemetry.ts。
/// 业务代码只依赖这个接口；接入 Sentry / Firebase 等 SDK 时实现它并替换 telemetryProvider。
abstract interface class Telemetry {
  void track(String name, [Map<String, Object?> properties = const {}]);
  void screenView(String name, [Map<String, Object?> properties = const {}]);
  void captureError(Object error, [StackTrace? stackTrace, Map<String, Object?> properties = const {}]);
  void identify(String userId, {String? email, String? name, String? role});
  void reset();
}

/// 空实现：未接入 SDK 时使用。
class NoopTelemetry implements Telemetry {
  const NoopTelemetry();

  @override
  void track(String name, [Map<String, Object?> properties = const {}]) {}

  @override
  void screenView(String name, [Map<String, Object?> properties = const {}]) {}

  @override
  void captureError(Object error, [StackTrace? stackTrace, Map<String, Object?> properties = const {}]) {}

  @override
  void identify(String userId, {String? email, String? name, String? role}) {}

  @override
  void reset() {}
}
