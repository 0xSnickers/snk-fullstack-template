import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/providers.dart';
import '../../../core/auth/models.dart';
import '../data/auth_api.dart';

enum AuthStatus { pending, authenticated, anonymous }

/// 登录态。pending：启动时正在恢复会话；authenticated：已登录；anonymous：未登录。
class AuthState {
  const AuthState._(this.status, this.user);

  const AuthState.pending() : this._(AuthStatus.pending, null);
  const AuthState.anonymous() : this._(AuthStatus.anonymous, null);
  const AuthState.authenticated(User user) : this._(AuthStatus.authenticated, user);

  final AuthStatus status;
  final User? user;

  bool get isAuthenticated => status == AuthStatus.authenticated;
}

final authApiProvider = Provider<AuthApi>(
  (ref) => AuthApi(
    client: ref.watch(apiClientProvider),
    tokenStore: ref.watch(tokenStoreProvider),
    storage: ref.watch(secureStorageProvider),
  ),
);

/// 登录态唯一来源。创建时会把刷新逻辑注册到 ApiClient，并尝试用 refreshToken 恢复会话。
class AuthController extends Notifier<AuthState> {
  AuthApi get _api => ref.read(authApiProvider);

  @override
  AuthState build() {
    final client = ref.watch(apiClientProvider);
    client
      ..refreshHandler = (_) async {
        final session = await _api.refresh();
        _setUser(session.user);
        return session.accessToken;
      }
      ..onUnauthorized = () => clear();

    Future.microtask(_restore);
    return const AuthState.pending();
  }

  Future<void> login({required String email, required String password}) async {
    final session = await _api.login(email: email, password: password);
    _setUser(session.user);
    ref.read(telemetryProvider).track('auth_login_success', {'role': session.user.role});
  }

  Future<void> register({required String name, required String email, required String password}) async {
    final session = await _api.register(name: name, email: email, password: password);
    _setUser(session.user);
    ref.read(telemetryProvider).track('auth_register_success', {'role': session.user.role});
  }

  Future<void> logout() async {
    try {
      await _api.logout();
    } finally {
      await clear();
    }
  }

  /// 清空会话：Token、用户。依赖登录态的数据 Provider 会随 authControllerProvider 失效。
  Future<void> clear() async {
    await _api.clear();
    ref.read(telemetryProvider).reset();
    state = const AuthState.anonymous();
  }

  Future<void> _restore() async {
    try {
      final session = await _api.refresh();
      _setUser(session.user);
    } catch (_) {
      await clear();
    }
  }

  void _setUser(User user) {
    ref.read(telemetryProvider).identify(user.id, email: user.email, name: user.name, role: user.role);
    state = AuthState.authenticated(user);
  }
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);
