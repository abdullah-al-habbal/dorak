import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:core/src/storage/token_storage_keys.entity.dart';

abstract class TokenStorage {
  Future<String?> read();

  Future<void> write(String token);

  Future<void> clear();
}

class SecureTokenStorage implements TokenStorage {
  final FlutterSecureStorage _storage;

  SecureTokenStorage({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  @override
  Future<String?> read() async {
    final token = await _storage.read(
      key: TokenStorageKeys.tokenStorageClientSessionKey,
    );
    if (token == null || token.isEmpty) {
      return null;
    }
    return token;
  }

  @override
  Future<void> write(String token) => _storage.write(
    key: TokenStorageKeys.tokenStorageClientSessionKey,
    value: token,
  );

  @override
  Future<void> clear() =>
      _storage.delete(key: TokenStorageKeys.tokenStorageClientSessionKey);
}

class SecureBranchTokenStorage implements TokenStorage {
  final FlutterSecureStorage _storage;

  SecureBranchTokenStorage({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  @override
  Future<String?> read() async {
    final token = await _storage.read(
      key: TokenStorageKeys.tokenStorageBranchSessionKey,
    );
    if (token == null || token.isEmpty) return null;
    return token;
  }

  @override
  Future<void> write(String token) => _storage.write(
    key: TokenStorageKeys.tokenStorageBranchSessionKey,
    value: token,
  );

  @override
  Future<void> clear() =>
      _storage.delete(key: TokenStorageKeys.tokenStorageBranchSessionKey);
}

class SecureBarberTokenStorage implements TokenStorage {
  final FlutterSecureStorage _storage;

  SecureBarberTokenStorage({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  @override
  Future<String?> read() async {
    final token = await _storage.read(
      key: TokenStorageKeys.tokenStorageBarberSessionKey,
    );
    if (token == null || token.isEmpty) return null;
    return token;
  }

  @override
  Future<void> write(String token) => _storage.write(
    key: TokenStorageKeys.tokenStorageBarberSessionKey,
    value: token,
  );

  @override
  Future<void> clear() =>
      _storage.delete(key: TokenStorageKeys.tokenStorageBarberSessionKey);
}
