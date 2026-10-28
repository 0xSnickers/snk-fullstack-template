/// 环境变量唯一入口，通过 `--dart-define-from-file=env/dev.json` 注入（见 README）。
/// 这些值会编译进 App，不要放密钥。
abstract final class Env {
  static const appName = String.fromEnvironment('APP_NAME', defaultValue: 'Flutter App');
  static const appEnv = String.fromEnvironment('APP_ENV', defaultValue: 'development');
  static const appRelease = String.fromEnvironment('APP_RELEASE');

  /// 后端地址。Android 模拟器访问电脑上的服务使用 10.0.2.2，真机使用电脑局域网 IP。
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:9000/api/v1',
  );

  static bool get isProduction => appEnv == 'production';
}
