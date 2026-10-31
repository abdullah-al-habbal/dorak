import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract class TokenStorage {
  Future<String?> read();

  Future<void> write(String token);

  Future<void> clear();
}

class SecureTokenStorage implements TokenStorage {
  static const String _clientSessionTokenStorageKey = 'dorak_client_token';

  final FlutterSecureStorage _storage;

  SecureTokenStorage({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  @override
  Future<String?> read() async {
    final token = await _storage.read(key: _clientSessionTokenStorageKey);
    if (token == null || token.isEmpty) {
      return null;
    }
    return token;
  }

  @override
  Future<void> write(String token) =>
      _storage.write(key: _clientSessionTokenStorageKey, value: token);

  @override
  Future<void> clear() => _storage.delete(key: _clientSessionTokenStorageKey);
}

class SecureBranchTokenStorage implements TokenStorage {
  static const String _branchSessionTokenStorageKey = 'dorak_branch_token';

  final FlutterSecureStorage _storage;

  SecureBranchTokenStorage({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  @override
  Future<String?> read() async {
    final token = await _storage.read(key: _branchSessionTokenStorageKey);
    if (token == null || token.isEmpty) return null;
    return token;
  }

  @override
  Future<void> write(String token) =>
      _storage.write(key: _branchSessionTokenStorageKey, value: token);

  @override
  Future<void> clear() => _storage.delete(key: _branchSessionTokenStorageKey);
}

class SecureBarberTokenStorage implements TokenStorage {
  static const String _barberSessionTokenStorageKey = 'dorak_barber_token';

  final FlutterSecureStorage _storage;

  SecureBarberTokenStorage({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  @override
  Future<String?> read() async {
    final token = await _storage.read(key: _barberSessionTokenStorageKey);
    if (token == null || token.isEmpty) return null;
    return token;
  }

  @override
  Future<void> write(String token) =>
      _storage.write(key: _barberSessionTokenStorageKey, value: token);

  @override
  Future<void> clear() => _storage.delete(key: _barberSessionTokenStorageKey);
}
