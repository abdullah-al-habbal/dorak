import 'dart:convert';

import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  Future<String?> Function() token() =>
      () async => 'live-token';

  Future<ApiException> failingGet(ApiClient api, String path) async {
    try {
      await api.get<int>(path, parser: (_) => 0);
      throw StateError('expected an ApiException');
    } on ApiException catch (e) {
      return e;
    }
  }

  test(
    '401 on an authenticated non-lifecycle request fires the signal',
    () async {
      final api = clientWithStatuses(
        [401],
        tokenProvider: token(),
        maxRetries: 0,
      );

      final error = await failingGet(api, '/client/profile');

      expect(error.isUnauthorized, isTrue);
      expect(api.unauthorizedSignalFired, isTrue);
    },
  );

  test('403 is treated the same as 401', () async {
    final api = clientWithStatuses(
      [403],
      tokenProvider: token(),
      maxRetries: 0,
    );

    final error = await failingGet(api, '/client/profile');

    expect(error.isForbidden, isTrue);
    expect(api.unauthorizedSignalFired, isTrue);
  });

  test('ACCOUNT_BANNED gets its own session signal stream', () async {
    final dio = Dio(BaseOptions(baseUrl: 'http://test/api/v1'));
    dio.httpClientAdapter = FakeHttpClientAdapter(
      (options) => Future.value(
        ResponseBody.fromString(
          jsonEncode(
            errorEnvelope(
              code: 'ACCOUNT_BANNED',
              statusCode: 403,
              message: 'Account suspended',
            ),
          ),
          403,
          headers: {
            'content-type': ['application/json'],
          },
        ),
      ),
    );
    final api = ApiClient(
      baseUrl: 'http://test/api/v1',
      dio: dio,
      enableLogging: false,
      maxRetries: 0,
      tokenProvider: token(),
    );
    var bannedNotifications = 0;
    final subscription = api.accountBannedStream.listen((_) {
      bannedNotifications++;
    });
    addTearDown(subscription.cancel);

    final error = await failingGet(api, '/client/profile');

    expect(error.code, 'ACCOUNT_BANNED');
    expect(bannedNotifications, 1);
    expect(api.unauthorizedSignalFired, isFalse);
  });

  test(
    'a business 403 (brand_not_approved) never signs the user out',
    () async {
      final dio = Dio(BaseOptions(baseUrl: 'http://test/api/v1'));
      dio.httpClientAdapter = FakeHttpClientAdapter(
        (options) => Future.value(
          ResponseBody.fromString(
            jsonEncode(
              errorEnvelope(
                code: 'brand_not_approved',
                statusCode: 403,
                message: 'Brand not approved',
              ),
            ),
            403,
            headers: {
              'content-type': ['application/json'],
            },
          ),
        ),
      );
      final api = ApiClient(
        baseUrl: 'http://test/api/v1',
        dio: dio,
        enableLogging: false,
        maxRetries: 0,
        tokenProvider: token(),
      );

      final error = await failingGet(api, '/affiliations/abc/accept');

      expect(error.isForbidden, isTrue);
      expect(error.code, 'brand_not_approved');
      expect(api.unauthorizedSignalFired, isFalse);
    },
  );

  test('auth-lifecycle routes never fire the signal', () async {
    final paths = <String>[
      AuthEndpoints.login,
      AuthEndpoints.register,
      AuthEndpoints.logout,
      AuthEndpoints.refreshToken,
      AuthEndpoints.forgotPassword,
      AuthEndpoints.verifyResetCode,
      AuthEndpoints.resetPassword,
      AuthEndpoints.verifyEmail,
      AuthEndpoints.sendEmailVerification,
      AuthEndpoints.changePassword,
      AuthEndpoints.socialLogin('google'),
    ];

    for (final path in paths) {
      final api = clientWithStatuses(
        [401],
        tokenProvider: token(),
        maxRetries: 0,
      );

      final error = await failingGet(api, path);

      expect(error.isUnauthorized, isTrue);
      expect(api.unauthorizedSignalFired, isFalse, reason: path);
    }
  });

  test('a 401 without a bearer token is not a session expiry', () async {
    final api = clientWithStatuses(
      [401],
      tokenProvider: () async => null,
      maxRetries: 0,
    );

    final error = await failingGet(api, '/client/profile');

    expect(error.isUnauthorized, isTrue);
    expect(api.unauthorizedSignalFired, isFalse);
  });

  test('a transport failure is not a session expiry', () async {
    final dio = Dio(BaseOptions(baseUrl: 'http://test/api/v1'));
    dio.httpClientAdapter = FakeHttpClientAdapter((options) {
      throw DioException(
        requestOptions: options,
        type: DioExceptionType.connectionError,
      );
    });
    final api = ApiClient(
      baseUrl: 'http://test/api/v1',
      dio: dio,
      enableLogging: false,
      maxRetries: 0,
      tokenProvider: token(),
    );

    await expectLater(
      api.get<int>('/client/profile', parser: (_) => 0),
      throwsA(isA<NetworkException>()),
    );
    expect(api.unauthorizedSignalFired, isFalse);
  });

  test('a 500 is not a session expiry', () async {
    final api = clientWithStatuses(
      [500],
      tokenProvider: token(),
      maxRetries: 0,
    );

    final error = await failingGet(api, '/client/profile');

    expect(error.isServerError, isTrue);
    expect(api.unauthorizedSignalFired, isFalse);
  });

  test('a burst of 401s fires exactly once until reset', () async {
    final api = clientWithStatuses(
      [401],
      tokenProvider: token(),
      maxRetries: 0,
    );

    var notifications = 0;
    final subscription = api.unauthorizedStream.listen((_) => notifications++);
    addTearDown(subscription.cancel);

    await failingGet(api, '/client/profile');
    await failingGet(api, '/client/profile');
    await failingGet(api, '/client/profile');

    expect(api.unauthorizedSignalFired, isTrue);
    expect(notifications, 1);

    api.resetUnauthorizedSignal();

    await failingGet(api, '/client/profile');

    expect(notifications, 2);
    expect(api.unauthorizedSignalFired, isTrue);
  });
}
