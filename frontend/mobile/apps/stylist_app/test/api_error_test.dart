import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';
import 'package:flutter/widgets.dart';

import 'package:stylist_app/src/core/errors/api_error.entity.dart';

void main() {
  late AppLocalizations l10n;

  setUpAll(() async {
    l10n = await AppLocalizations.delegate.load(const Locale('en'));
  });

  String loginMessage(Object error) => ApiError.from(
    error,
    l10n,
    rejectedCredentialsMessage: l10n.loginErrorInvalidCredentials,
  ).message;

  ApiException status(int code) =>
      ApiException(statusCode: code, code: 'X', message: 'raw');

  test('login blames the credentials only when they were rejected', () {
    for (final code in [401, 403, 422]) {
      expect(loginMessage(status(code)), l10n.loginErrorInvalidCredentials);
    }
    expect(
      loginMessage(
        const ValidationException(
          statusCode: 422,
          code: 'VALIDATION_FAILED',
          message: 'raw',
          errors: {},
        ),
      ),
      l10n.loginErrorInvalidCredentials,
    );
  });

  test('a server or rate-limit failure on login is not a wrong password', () {
    for (final code in [429, 500, 502, 503]) {
      expect(loginMessage(status(code)), l10n.errorGeneric);
    }
  });

  test('only a transport failure says there is no connection', () {
    expect(
      loginMessage(
        const NetworkException(
          type: DioExceptionType.connectionError,
          retryable: true,
          message: 'raw',
        ),
      ),
      l10n.errorNetwork,
    );
    expect(ApiError.from(status(502), l10n).message, l10n.errorGeneric);
  });
}
