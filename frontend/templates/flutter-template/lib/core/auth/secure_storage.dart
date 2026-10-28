import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// 平台无关的异步键值存储，对应 core/auth/nativeAuth.ts 中的 KeyValueStorage。
abstract interface class KeyValueStorage {
  Future<String?> read(String key);
  Future<void> write(String key, String value);
  Future<void> delete(String key);
}

/// iOS Keychain / Android Keystore；Web 端由 flutter_secure_storage 使用加密的 localStorage。
class SecureKeyValueStorage implements KeyValueStorage {
  SecureKeyValueStorage([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  @override
  Future<String?> read(String key) => _storage.read(key: key);

  @override
  Future<void> write(String key, String value) => _storage.write(key: key, value: value);

  @override
  Future<void> delete(String key) => _storage.delete(key: key);
}

/// 内存实现，用于测试。
class MemoryKeyValueStorage implements KeyValueStorage {
  final data = <String, String>{};

  @override
  Future<String?> read(String key) async => data[key];

  @override
  Future<void> write(String key, String value) async => data[key] = value;

  @override
  Future<void> delete(String key) async => data.remove(key);
}
