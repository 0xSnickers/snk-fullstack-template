import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/application/auth_controller.dart';
import '../features/auth/application/redirect.dart';
import '../features/auth/presentation/auth_page.dart';
import '../features/auth/presentation/widgets/auth_form.dart';
import '../features/home/home_page.dart';
import '../features/not_found/not_found_page.dart';
import '../features/profile/profile_page.dart';

/// 需要登录的页面。新增受保护页面时把路径加到这里。
const protectedPaths = {'/profile'};

/// 仅未登录可访问的页面。
const guestPaths = {'/login', '/register'};

/// 路由表 + 鉴权守卫。登录态变化时 GoRouter 会重新执行 redirect。
final routerProvider = Provider<GoRouter>((ref) {
  final auth = ValueNotifier<AuthState>(ref.read(authControllerProvider));
  ref
    ..listen(authControllerProvider, (_, next) => auth.value = next)
    ..onDispose(auth.dispose);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: auth,
    redirect: (context, state) {
      final status = auth.value.status;
      final path = state.matchedLocation;

      // 启动时正在恢复会话：先停留，页面自行显示加载态，恢复完成后会再次执行 redirect。
      if (status == AuthStatus.pending) return null;

      if (protectedPaths.contains(path) && status == AuthStatus.anonymous) {
        return Uri(path: '/login', queryParameters: {'redirect': state.uri.toString()}).toString();
      }
      if (guestPaths.contains(path) && status == AuthStatus.authenticated) {
        return safeRedirect(state.uri.queryParameters['redirect']);
      }
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (context, state) => const HomePage()),
      GoRoute(
        path: '/login',
        builder: (context, state) =>
            AuthPage(mode: AuthMode.login, redirect: state.uri.queryParameters['redirect']),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) =>
            AuthPage(mode: AuthMode.register, redirect: state.uri.queryParameters['redirect']),
      ),
      GoRoute(path: '/profile', builder: (context, state) => const ProfilePage()),
    ],
    errorBuilder: (context, state) => const NotFoundPage(),
  );
});
