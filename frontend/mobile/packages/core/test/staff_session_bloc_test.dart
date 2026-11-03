import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late _MemoryTokenStorage storage;
  late _FakeStaffAuthRepository repository;
  late StaffSessionBloc session;

  setUp(() {
    storage = _MemoryTokenStorage();
    repository = _FakeStaffAuthRepository();
    session = StaffSessionBloc(repository, storage);
  });

  tearDown(() => session.close());

  test('login stores token and authenticates the session', () async {
    await session.login(email: 'a@b.com', password: 'secret123');

    expect(session.state.status, StaffAuthStatus.authenticated);
    expect(storage.token, 'staff-token');
  });

  test('restore and logout reflect stored-token state', () async {
    storage.token = 'staff-token';

    await session.restore();
    expect(session.state.isAuthenticated, isTrue);

    await session.logout();
    expect(session.state.status, StaffAuthStatus.guest);
    expect(storage.token, isNull);
    expect(repository.loggedOut, isTrue);
  });

  test(
    'logout clears credentials even when the server is unreachable',
    () async {
      storage.token = 'staff-token';
      repository.failure = StateError('offline');
      await session.restore();

      await session.logout();

      expect(session.state.status, StaffAuthStatus.guest);
      expect(storage.token, isNull);
    },
  );

  test('refresh replaces the stored token', () async {
    storage.token = 'staff-token';
    await session.restore();

    expect(await session.refresh(), isTrue);
    expect(storage.token, 'refreshed-token');
    expect(session.state.isAuthenticated, isTrue);
  });

  test('a failed refresh keeps the current session', () async {
    storage.token = 'staff-token';
    repository.failure = StateError('rejected');
    await session.restore();

    expect(await session.refresh(), isFalse);
    expect(storage.token, 'staff-token');
    expect(session.state.isAuthenticated, isTrue);
  });

  test('refresh does nothing for a guest', () async {
    expect(await session.refresh(), isFalse);
    expect(storage.token, isNull);
  });

  test('unauthorized response clears credentials', () async {
    storage.token = 'staff-token';

    await session.unauthorized();

    expect(session.state.status, StaffAuthStatus.guest);
    expect(storage.token, isNull);
  });
}

class _FakeStaffAuthRepository implements StaffAuthRepository {
  bool loggedOut = false;
  Object? failure;

  @override
  Future<String> login({
    required String email,
    required String password,
  }) async => 'staff-token';

  @override
  Future<void> logout() async {
    loggedOut = true;
    if (failure != null) throw failure!;
  }

  @override
  Future<String> refreshToken() async {
    if (failure != null) throw failure!;
    return 'refreshed-token';
  }

  @override
  Future<void> forgotPassword(String email) async {}

  @override
  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) async {}
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
