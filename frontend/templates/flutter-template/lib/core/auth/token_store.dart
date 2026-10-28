/// accessToken 只放内存；refreshToken 由 [SecureKeyValueStorage] 保存在 Keychain / Keystore。
class TokenStore {
  String? _token;

  String? get accessToken => _token;

  void set(String token) => _token = token;

  void clear() => _token = null;
}
