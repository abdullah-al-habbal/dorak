import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/auth/business_login.screen.dart';
import 'package:business_app/src/features/owner/app_role.entity.dart';

class _RefusingAuth implements StaffAuthRepository {
  _RefusingAuth(this.failure);

  final Object failure;

  @override
  Future<String> login({required String email, required String password}) =>
      Future.error(failure);

  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

class _EmptyStorage implements TokenStorage {
  @override
  Future<void> clear() async {}

  @override
  Future<String?> read() async => null;

  @override
  Future<void> write(String value) async {}
}

void main() {
  late AppLocalizations l10n;

  setUpAll(() async {
    l10n = await AppLocalizations.delegate.load(const Locale('en'));
  });

  Future<void> signInFailing(WidgetTester tester, Object failure) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);
    final session = StaffSessionBloc(_RefusingAuth(failure), _EmptyStorage());
    addTearDown(session.close);
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: BusinessLoginScreen(
          session: session,
          onAuthenticated: () {},
          onLocaleToggle: () {},
          onForgotPassword: () {},
          role: AppRole.branch,
          onRoleChanged: (_) {},
          onRegisterAsOwner: () {},
        ),
      ),
    );
    await tester.enterText(find.byType(TextFormField).first, 'a@b.test');
    await tester.enterText(find.byType(TextFormField).last, 'secret');
    await tester.tap(find.text(l10n.loginButton));
    await tester.pumpAndSettle();
  }

  ApiException status(int code) =>
      ApiException(statusCode: code, code: 'X', message: 'raw');

  final rejected = <String, Object>{
    '401': status(401),
    '403': status(403),
    '422': status(422),
    'a validation error': const ValidationException(
      statusCode: 422,
      code: 'VALIDATION_FAILED',
      message: 'raw',
      errors: {
        'email': ['These credentials do not match our records.'],
      },
    ),
  };

  for (final MapEntry(key: name, value: failure) in rejected.entries) {
    testWidgets('$name reads as rejected credentials', (tester) async {
      await signInFailing(tester, failure);

      expect(find.text(l10n.loginErrorInvalidCredentials), findsOneWidget);
    });
  }

  for (final code in [429, 500, 502, 503]) {
    testWidgets('$code is not blamed on the credentials', (tester) async {
      await signInFailing(tester, status(code));

      expect(find.text(l10n.errorGeneric), findsOneWidget);
      expect(find.text(l10n.loginErrorInvalidCredentials), findsNothing);
    });
  }

  testWidgets('a transport failure says there is no connection', (
    tester,
  ) async {
    await signInFailing(
      tester,
      const NetworkException(
        type: DioExceptionType.connectionError,
        retryable: true,
        message: 'raw',
      ),
    );

    expect(find.text(l10n.errorNetwork), findsOneWidget);
  });
}
