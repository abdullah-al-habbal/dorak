import 'dart:convert';

import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_auth.dart';
import 'helpers/fake_dio.dart';

class _FixedVersion implements AppInfoProvider {
  const _FixedVersion();

  @override
  Future<String> version() async => '1.0.0+1';
}

/// Every client here carries a bearer token, so `AuthInterceptor` is installed
/// and each case proves what happens to the session, not only the thrown type.
void main() {
  ApiClient clientAnswering(
    int status,
    String body, {
    String contentType = 'application/json',
  }) {
    final dio = Dio(BaseOptions(baseUrl: 'http://test/api/v1'));
    dio.httpClientAdapter = FakeHttpClientAdapter(
      (_) async => ResponseBody.fromString(
        body,
        status,
        headers: {
          'content-type': [contentType],
        },
      ),
    );
    return ApiClient(
      baseUrl: 'http://test/api/v1',
      dio: dio,
      enableLogging: false,
      maxRetries: 0,
      tokenProvider: () async => 'live-token',
    );
  }

  ApiClient clientFailing(int status, String code) => clientAnswering(
    status,
    jsonEncode(errorEnvelope(code: code, statusCode: status)),
  );

  Future<Object> failureOf(Future<void> call) async {
    try {
      await call;
    } catch (error) {
      return error;
    }
    throw StateError('expected a failure');
  }

  group('account deletion', () {
    final deletions = <String, Future<void> Function(ApiClient)>{
      'client': (api) => DioAuthRepository(api).deleteAccount('wrong'),
      'barber': (api) => DioStaffAuthRepository(
        api,
        StaffAuthRoutes.barber(),
      ).deleteAccount('wrong'),
    };

    for (final MapEntry(key: actor, value: delete) in deletions.entries) {
      test('a wrong password (401) keeps the $actor session', () async {
        final api = clientFailing(401, 'UNAUTHORIZED');

        final error = await failureOf(delete(api));

        expect((error as ApiException).isUnauthorized, isTrue);
        expect(api.unauthorizedSignalFired, isFalse);
      });

      test('an unlisted 403 still ends the $actor session', () async {
        final api = clientFailing(403, 'FORBIDDEN');

        await failureOf(delete(api));

        expect(api.unauthorizedSignalFired, isTrue);
      });

      test('a ban is still reported for the $actor', () async {
        final api = clientFailing(403, 'ACCOUNT_BANNED');
        final banned = expectLater(api.accountBannedStream, emits(anything));

        await failureOf(delete(api));

        await banned;
      });
    }

    test('a 401 on any other delete still ends the session', () async {
      final api = clientFailing(401, 'UNAUTHORIZED');

      await failureOf(api.delete('/client/favorites/1'));

      expect(api.unauthorizedSignalFired, isTrue);
    });
  });

  group('business-rule 403', () {
    for (final code in [
      'brand_not_approved',
      'brand_suspended',
      'feature_not_enabled',
    ]) {
      test('$code keeps the session', () async {
        final api = clientFailing(403, code);

        final error = await failureOf(
          api.post<void>('/owner/branches', parser: (_) {}),
        );

        expect((error as ApiException).code, code);
        expect(api.unauthorizedSignalFired, isFalse);
      });
    }

    test('a plain FORBIDDEN ends the session', () async {
      final api = clientFailing(403, 'FORBIDDEN');

      await failureOf(api.post<void>('/owner/branches', parser: (_) {}));

      expect(api.unauthorizedSignalFired, isTrue);
    });
  });

  group('non-envelope error responses', () {
    for (final status in [401, 403, 404, 429, 500, 502, 503]) {
      test('an HTML $status keeps its status', () async {
        final api = clientAnswering(
          status,
          '<html><body>error</body></html>',
          contentType: 'text/html',
        );

        final error = await failureOf(
          api.get<void>('/client/profile', parser: (_) {}),
        );

        expect(error, isNot(isA<NetworkException>()));
        expect((error as ApiException).statusCode, status);
        expect(error.code, 'INVALID_RESPONSE');
        expect(api.unauthorizedSignalFired, status == 401 || status == 403);
      });
    }

    test('a gateway error on restore keeps the stored session', () async {
      final api = clientAnswering(502, 'Bad gateway', contentType: 'text/html');
      final storage = InMemoryTokenStorage()..token = 'stored-token';
      final bloc = SessionBloc(
        DioAuthRepository(api),
        storage,
        DioProfileRepository(api),
      );
      addTearDown(bloc.close);

      bloc.add(RestoreRequested());
      final restored = await bloc.stream.firstWhere((s) => !s.isLoading);

      expect(restored.status, AuthStatus.authenticated);
      expect(restored.error, isNot(isA<NetworkException>()));
      expect(storage.token, 'stored-token');
    });

    test('feedback does not report a gateway error as offline', () async {
      final api = clientAnswering(502, 'Bad gateway', contentType: 'text/html');
      final bloc = FeedbackBloc(
        DioFeedbackRepository(api),
        FeedbackApp.client,
        appInfo: const _FixedVersion(),
        platformName: () => 'android',
      );
      addTearDown(bloc.close);

      bloc.add(
        const FeedbackSubmitted(
          kind: FeedbackKind.bug,
          message: 'The confirm button does nothing',
          locale: 'en',
          screen: 'about',
        ),
      );
      final failed = await bloc.stream.firstWhere((s) => !s.isSending);

      expect(failed.failure, FeedbackFailure.unknown);
    });

    test('a JSON list error body keeps its status', () async {
      final api = clientAnswering(500, '[]');

      final error = await failureOf(
        api.get<void>('/client/profile', parser: (_) {}),
      );

      expect((error as ApiException).statusCode, 500);
    });

    test('no response at all is still a NetworkException', () async {
      final dio = Dio(BaseOptions(baseUrl: 'http://test/api/v1'));
      dio.httpClientAdapter = FakeHttpClientAdapter(
        (options) => throw DioException.connectionTimeout(
          timeout: const Duration(seconds: 1),
          requestOptions: options,
        ),
      );
      final api = ApiClient(
        baseUrl: 'http://test/api/v1',
        dio: dio,
        enableLogging: false,
        maxRetries: 0,
      );

      final error = await failureOf(
        api.get<void>('/client/profile', parser: (_) {}),
      );

      expect(error, isA<NetworkException>());
    });
  });
}
