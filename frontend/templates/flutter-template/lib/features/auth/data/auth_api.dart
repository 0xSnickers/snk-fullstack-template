import 'package:dio/dio.dart';

import '../../../core/auth/models.dart';
import '../../../core/auth/secure_storage.dart';
import '../../../core/auth/token_store.dart';
import '../../../core/http/api_client.dart';
import '../../../core/http/api_exception.dart';
import '../../../core/utils/single_flight.dart';

/// App 端鉴权接口，对应 core/auth/nativeAuth.ts：
/// - 请求体带 `clientType: 'native'`，后端在响应体返回 refreshToken；
/// - accessToken 只放内存（[TokenStore]），refreshToken 放安全存储；
/// - 刷新时后端会旋转 refreshToken。
class AuthApi {
  AuthApi({required ApiClient client, required TokenStore tokenStore, required KeyValueStorage storage})
      : _client = client,
        _tokenStore = tokenStore,
        _storage = storage {
    _refresh = SingleFlight(_doRefresh);
  }

  static const clientType = 'native';
  static const refreshTokenKey = 'app.refresh-token';

  final ApiClient _client;
  final TokenStore _tokenStore;
  final KeyValueStorage _storage;
  late final SingleFlight<AuthSession> _refresh;

  Future<AuthSession> login({required String email, required String password}) async {
    final session = await _client.post(
      '/auth/login',
      body: {'email': email, 'password': password, 'clientType': clientType},
      decode: AuthSession.fromJson,
    );
    return _persist(session);
  }

  Future<AuthSession> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final session = await _client.post(
      '/auth/register',
      body: {'name': name, 'email': email, 'password': password, 'clientType': clientType},
      decode: AuthSession.fromJson,
    );
    return _persist(session);
  }

  /// 用 refreshToken 换取新会话；并发调用只发一次请求。
  Future<AuthSession> refresh() => _refresh();

  Future<void> logout() async {
    final refreshToken = await _storage.read(refreshTokenKey);
    try {
      await _client.post<void>(
        '/auth/logout',
        body: {'clientType': clientType, 'refreshToken': refreshToken},
        decode: (_) {},
      );
    } finally {
      await clear();
    }
  }

  Future<void> clear() async {
    _tokenStore.clear();
    await _storage.delete(refreshTokenKey);
  }

  Future<AuthSession> _doRefresh() async {
    final refreshToken = await _storage.read(refreshTokenKey);
    if (refreshToken == null || refreshToken.isEmpty) {
      throw const ApiException('Unauthorized', code: 'UNAUTHORIZED', status: 401);
    }

    try {
      final response = await _client.bare.post<Object?>(
        '/auth/refresh',
        data: {'clientType': clientType, 'refreshToken': refreshToken},
      );
      return _persist(AuthSession.fromJson(ApiClient.unwrap(response.data)));
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  Future<AuthSession> _persist(AuthSession session) async {
    _tokenStore.set(session.accessToken);
    final refreshToken = session.refreshToken;
    if (refreshToken != null) await _storage.write(refreshTokenKey, refreshToken);
    return session;
  }
}
