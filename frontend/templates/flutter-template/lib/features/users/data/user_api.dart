import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/providers.dart';
import '../../../core/auth/models.dart';
import '../../../core/http/api_client.dart';
import '../../../core/http/api_response.dart';
import '../../auth/application/auth_controller.dart';

class UserApi {
  const UserApi(this._client);

  final ApiClient _client;

  Future<PageResult<User>> getUsers({int page = 1, int limit = 10}) => _client.get(
        '/users',
        query: {'page': page, 'limit': limit},
        decode: (data) => PageResult.fromJson(data, User.fromJson),
      );
}

final userApiProvider = Provider<UserApi>((ref) => UserApi(ref.watch(apiClientProvider)));

/// 受保护接口示例：登录用户变化（登录 / 退出）时自动重新请求。
/// 刷新：ref.invalidate(usersProvider)。
final usersProvider = FutureProvider.autoDispose<PageResult<User>>((ref) {
  ref.watch(authControllerProvider.select((state) => state.user?.id));
  return ref.watch(userApiProvider).getUsers(limit: 5);
});
