import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/create_new_password.screen.dart';
import 'package:client_app/src/features/auth/password_recovery.bloc.dart';
import 'package:client_app/src/features/booking/branch_booking_error.entity.dart';

import 'helpers/fakes.dart';

ValidationException _validation(String message) => ValidationException(
  statusCode: 422,
  code: 'VALIDATION_FAILED',
  message: 'raw',
  errors: {
    'email': [message],
  },
);

void main() {
  testWidgets('a form without inline errors shows the server message', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);
    final bloc = PasswordRecoveryBloc(
      FakeAuthRepository()
        ..resetPasswordError = const ValidationException(
          statusCode: 422,
          code: 'VALIDATION_FAILED',
          message: 'raw',
          errors: {
            'password': ['Choose a password you have not used.'],
          },
        ),
    );
    addTearDown(bloc.close);
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: CreateNewPasswordScreen(recovery: bloc, onReenterCode: () {}),
      ),
    );
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).first, 'new-secret123');
    await tester.enterText(find.byType(TextFormField).last, 'new-secret123');
    await tester.tap(find.byType(PrimaryButton));
    await tester.pumpAndSettle();

    expect(find.text('Choose a password you have not used.'), findsOneWidget);
  });

  group('booking submit', () {
    late AppLocalizations l10n;

    setUpAll(() async {
      l10n = await AppLocalizations.delegate.load(const Locale('en'));
    });

    test('shows a safe validation message', () {
      expect(
        BranchBookingError.submitMessage(
          l10n,
          _validation('Pick a later time.'),
        ),
        'Pick a later time.',
      );
    });

    test('drops an untranslated key or markup', () {
      for (final unsafe in ['validation.required', '<b>no</b>']) {
        expect(
          BranchBookingError.submitMessage(l10n, _validation(unsafe)),
          l10n.errorGeneric,
        );
      }
    });
  });
}
