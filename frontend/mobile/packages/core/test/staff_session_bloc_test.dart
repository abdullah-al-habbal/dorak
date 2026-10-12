import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('login stores token and authenticates the session', () async {
    final storage = _MemoryTokenStorage();
    final session = StaffSessionBloc(_FakeStaffAuthRepository(), storage);
    addTearDown(session.close);

    await session.login(email: 'a@b.com', password: 'secret123');

    expect(session.state.status, StaffAuthStatus.authenticated);
    expect(storage.token, 'staff-token');
  });

  test('restore and logout reflect stored-token state', () async {
    final storage = _MemoryTokenStorage()..token = 'staff-token';
    final session = StaffSessionBloc(_FakeStaffAuthRepository(), storage);
    addTearDown(session.close);

    await session.restore();
    expect(session.state.isAuthenticated, isTrue);

    await session.logout();
    expect(session.state.status, StaffAuthStatus.guest);
    expect(storage.token, isNull);
  });

  test('unauthorized response clears credentials', () async {
    final storage = _MemoryTokenStorage()..token = 'staff-token';
    final session = StaffSessionBloc(_FakeStaffAuthRepository(), storage);
    addTearDown(session.close);

    await session.unauthorized();

    expect(session.state.status, StaffAuthStatus.guest);
    expect(storage.token, isNull);
  });
}

class _FakeStaffAuthRepository implements StaffAuthRepository {
  @override
  Future<String> login({
    required String email,
    required String password,
  }) async => 'staff-token';
}

class _MemoryTokenStorage implements TokenStorage {
  String? token;

  @override
  Future<String?> read() async => token;

  @override
  Future<void> write(String token) async => this.token = token;

  @override
  Future<void> clear() async => token = null;
}
