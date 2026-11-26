import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

const _offline = NetworkException(
  type: DioExceptionType.connectionError,
  retryable: true,
  message: 'raw',
);

ApiException _api(int status, [String code = 'X']) =>
    ApiException(statusCode: status, code: code, message: 'raw');

ValidationException _validation(Map<String, List<String>> errors) =>
    ValidationException(
      statusCode: 422,
      code: 'VALIDATION_FAILED',
      message: 'raw',
      errors: errors,
    );

void main() {
  late AppLocalizations l10n;

  setUpAll(() async {
    l10n = await AppLocalizations.delegate.load(const Locale('en'));
  });

  ErrorFeedback feedback(
    Object error, {
    String? fallback,
    String? unauthorized,
    String? unprocessable,
    bool banner = false,
  }) => ErrorFeedback.from(
    error,
    l10n,
    fallbackMessage: fallback,
    unauthorizedMessage: unauthorized,
    unprocessableMessage: unprocessable,
    showsFieldMessagesInBanner: banner,
  );

  test('only a transport failure says there is no connection', () {
    expect(
      feedback(_offline, fallback: 'Could not save').message,
      l10n.errorNetwork,
    );
    expect(feedback(_api(502)).message, l10n.errorGeneric);
  });

  test('the server message of an API failure is never shown', () {
    for (final status in [400, 401, 403, 404, 409, 422, 429, 500]) {
      expect(feedback(_api(status), banner: true).message, isNot('raw'));
    }
  });

  test('the fallback covers whatever has no message of its own', () {
    for (final Object error in [_api(500), _api(429), StateError('x')]) {
      expect(feedback(error, fallback: 'Fallback').message, 'Fallback');
    }
  });

  test('account codes win over every override', () {
    expect(
      feedback(_api(403, 'ACCOUNT_BANNED'), unauthorized: 'Wrong').message,
      l10n.authAccountSuspended,
    );
    expect(
      feedback(_api(403, 'ACCOUNT_NOT_ACTIVE'), unauthorized: 'Wrong').message,
      l10n.authAccountNotActive,
    );
  });

  test('overrides answer only their own statuses', () {
    String message(int status) => feedback(
      _api(status),
      unauthorized: 'Unauthorized',
      unprocessable: 'Unprocessable',
    ).message;

    expect(message(401), 'Unauthorized');
    expect(message(403), 'Unauthorized');
    expect(message(422), 'Unprocessable');
    expect(message(500), l10n.errorGeneric);
  });

  test('fields show safe server messages, else the field fallback', () {
    final result = feedback(
      _validation({
        'email': ['Taken.'],
        'phone': ['validation.phone'],
        'name': [],
      }),
    );

    expect(result.errorsFor('email'), ['Taken.']);
    expect(result.firstErrorFor('phone'), l10n.fieldInvalid);
    expect(result.firstErrorFor('name'), l10n.fieldInvalid);
    expect(result.firstErrorFor('absent'), isNull);
  });

  group('validation banner precedence', () {
    final error = _validation({
      'email': ['Taken.'],
    });

    test('the 422 override wins', () {
      expect(
        feedback(
          error,
          unprocessable: 'Override',
          fallback: 'Fallback',
          banner: true,
        ).message,
        'Override',
      );
    });

    test('then the server messages, on a banner-only surface', () {
      expect(
        feedback(error, fallback: 'Fallback', banner: true).message,
        'Taken.',
      );
    });

    test('a form with inline errors does not repeat them', () {
      expect(feedback(error, fallback: 'Fallback').message, 'Fallback');
      expect(feedback(error).message, l10n.errorGeneric);
    });

    test('then the fallback when no message is safe', () {
      expect(
        feedback(
          _validation({
            'email': ['validation.required'],
          }),
          fallback: 'Fallback',
          banner: true,
        ).message,
        'Fallback',
      );
    });
  });

  test('a load message handles a missing error', () {
    expect(ErrorFeedback.loadMessage(l10n, null), l10n.errorGeneric);
    expect(ErrorFeedback.loadMessage(l10n, _offline), l10n.errorNetwork);
  });

  group('account deletion', () {
    String message(Object error, [Map<String, String> byCode = const {}]) =>
        DeleteAccountErrorMessage.of(l10n, error, byCode: byCode);

    test('a rejected password is named', () {
      expect(message(_api(401)), l10n.deleteAccountWrongPassword);
      expect(message(_validation({})), l10n.deleteAccountWrongPassword);
    });

    test('active bookings and app-specific codes are explained', () {
      expect(
        message(_api(409, 'ACCOUNT_HAS_ACTIVE_BOOKINGS')),
        l10n.deleteAccountActiveBookings,
      );
      expect(
        message(_api(409, 'ACCOUNT_HAS_ACTIVE_AFFILIATION'), {
          'ACCOUNT_HAS_ACTIVE_AFFILIATION': 'Leave the branch first',
        }),
        'Leave the branch first',
      );
    });

    test('other failures are not blamed on the password', () {
      expect(message(_api(403)), l10n.errorGeneric);
      expect(message(_api(500)), l10n.errorGeneric);
      expect(message(StateError('x')), l10n.errorGeneric);
      expect(message(_offline), l10n.errorNetwork);
    });
  });
}
