import 'dart:convert';

import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

class _Repository implements StaffAuthRepository {
  @override
  Future<String> login({
    required String email,
    required String password,
  }) async => 'live-token';

  @override
  Future<void> logout() async {}

  @override
  Future<String> refreshToken() async => 'live-token';

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

class _Storage implements TokenStorage {
  String? token;

  @override
  Future<String?> read() async => token;

  @override
  Future<void> write(String value) async => token = value;

  @override
  Future<void> clear() async => token = null;
}

void main() {
  late _Storage storage;
  late StaffSessionBloc session;
  late int teardowns;

  Future<ApiClient> signedInClient(int status, String code) async {
    final dio = Dio(BaseOptions(baseUrl: 'http://test/api/v1'));
    dio.httpClientAdapter = FakeHttpClientAdapter(
      (_) async => ResponseBody.fromString(
        jsonEncode(errorEnvelope(code: code, statusCode: status)),
        status,
        headers: {
          'content-type': ['application/json'],
        },
      ),
    );
    final api = ApiClient(
      baseUrl: 'http://test/api/v1',
      dio: dio,
      enableLogging: false,
      maxRetries: 0,
      tokenProvider: storage.read,
    );
    final signals = StaffSessionSignals(
      client: api,
      session: session,
      onSessionEnded: () async => teardowns++,
    );
    addTearDown(signals.dispose);
    await session.login(email: 'a@b.test', password: 'secret');
    return api;
  }

  Future<void> call(ApiClient api) async {
    await expectLater(
      api.get<void>('/barber/profile', parser: (_) {}),
      throwsA(isA<ApiException>()),
    );
    await pumpEventQueue();
  }

  setUp(() {
    storage = _Storage();
    session = StaffSessionBloc(_Repository(), storage);
    teardowns = 0;
  });

  tearDown(() => session.close());

  test(
    'a ban ends the session, keeps the reason and tears down once',
    () async {
      final api = await signedInClient(403, 'ACCOUNT_BANNED');

      await call(api);
      await call(api);

      expect(session.state.status, StaffAuthStatus.guest);
      expect(session.state.isBanned, isTrue);
      expect(storage.token, isNull);
      expect(teardowns, 1);
    },
  );

  test('a 401 after a ban does not erase the suspension', () async {
    final api = await signedInClient(403, 'ACCOUNT_BANNED');
    await call(api);

    await session.unauthorized();

    expect(session.state.isBanned, isTrue);
  });

  test('an expired token ends the session and tears down', () async {
    final api = await signedInClient(401, 'UNAUTHORIZED');

    await call(api);

    expect(session.state.status, StaffAuthStatus.guest);
    expect(session.state.isBanned, isFalse);
    expect(storage.token, isNull);
    expect(teardowns, 1);
  });

  test('a business 403 keeps the session', () async {
    final api = await signedInClient(403, 'feature_not_enabled');

    await call(api);

    expect(session.state.isAuthenticated, isTrue);
    expect(storage.token, 'live-token');
    expect(teardowns, 0);
  });

  test('signing in again clears the ban', () async {
    final api = await signedInClient(403, 'ACCOUNT_BANNED');
    await call(api);

    await session.login(email: 'a@b.test', password: 'secret');

    expect(session.state.isAuthenticated, isTrue);
    expect(session.state.isBanned, isFalse);
  });
}
