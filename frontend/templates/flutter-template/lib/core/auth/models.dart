/// 当前登录用户，对应 core/auth/types.ts 中的 User。字段按后端实际返回调整。
class User {
  const User({required this.id, required this.name, required this.role, this.email});

  final String id;
  final String name;
  final String? email;
  final String role;

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as String,
        name: json['name'] as String,
        email: json['email'] as String?,
        role: json['role'] as String,
      );
}

/// App 端会话：响应体中带 refreshToken（请求体 clientType: 'native'）。
class AuthSession {
  const AuthSession({required this.user, required this.accessToken, this.refreshToken});

  final User user;
  final String accessToken;
  final String? refreshToken;

  factory AuthSession.fromJson(Object? json) {
    final map = json as Map<String, dynamic>;
    return AuthSession(
      user: User.fromJson(map['user'] as Map<String, dynamic>),
      accessToken: map['accessToken'] as String,
      refreshToken: map['refreshToken'] as String?,
    );
  }
}
