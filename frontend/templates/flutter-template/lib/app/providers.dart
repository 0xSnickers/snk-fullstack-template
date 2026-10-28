import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/auth/secure_storage.dart';
import '../core/auth/token_store.dart';
import '../core/config/env.dart';
import '../core/http/api_client.dart';
import '../core/telemetry/telemetry.dart';
import '../shared/preferences/preferences_controller.dart';

/// 在 main.dart 中通过 overrideWithValue 注入。
final sharedPreferencesProvider = Provider<SharedPreferences>(
  (ref) => throw UnimplementedError('sharedPreferencesProvider must be overridden in main()'),
);

/// 遥测实现：默认空实现，接入 SDK 时替换这里即可。
final telemetryProvider = Provider<Telemetry>((ref) => const NoopTelemetry());

final tokenStoreProvider = Provider<TokenStore>((ref) => TokenStore());

final secureStorageProvider = Provider<KeyValueStorage>((ref) => SecureKeyValueStorage());

/// 应用唯一的 HTTP 客户端。
final apiClientProvider = Provider<ApiClient>((ref) {
  final tokenStore = ref.watch(tokenStoreProvider);
  final telemetry = ref.watch(telemetryProvider);

  return ApiClient(
    baseUrl: Env.apiBaseUrl,
    getAccessToken: () => tokenStore.accessToken,
    getLocale: () => ref.read(preferencesProvider).localeTag,
  )..onError = (error, request) => telemetry.captureError(error, null, {
        'source': 'api_request_failed',
        'url': request.path,
        'method': request.method,
        'status': error.status,
        'code': error.code,
      });
});
