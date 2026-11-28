import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/profile_edit.screen.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeProfileRepository repository;
  ClientDto? saved;
  String? verifyEmail;
  String? verifyPhone;

  setUp(() {
    repository = FakeProfileRepository();
    saved = null;
    verifyEmail = null;
    verifyPhone = null;
  });

  Future<void> openEdit(WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Builder(
          builder: (context) => Scaffold(
            body: TextButton(
              onPressed: () => Navigator.of(context).push<void>(
                MaterialPageRoute(
                  builder: (_) => ProfileEditScreen(
                    repository: repository,
                    name: 'Sara',
                    phone: '+963900000000',
                    email: 'sara@example.com',
                    onSaved: (client) => saved = client,
                    onEmailVerificationRequired: (email) => verifyEmail = email,
                    onPhoneVerificationRequired: (phone) => verifyPhone = phone,
                  ),
                ),
              ),
              child: const Text('open'),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
  }

  testWidgets('shows the current email and saves without verification', (
    tester,
  ) async {
    await openEdit(tester);

    expect(find.text('sara@example.com'), findsOneWidget);
    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();

    expect(repository.updateCalls, 1);
    expect(repository.lastEmail, isNull);
    expect(repository.lastCurrentPassword, isNull);
    expect(saved?.email, 'sara@example.com');
    expect(verifyEmail, isNull);
    expect(find.text('Edit profile'), findsNothing);
  });

  testWidgets('changing the email routes to email verification', (
    tester,
  ) async {
    await openEdit(tester);

    await tester.enterText(
      find.widgetWithText(TextField, 'sara@example.com'),
      'new@example.com',
    );
    await tester.pump();
    await tester.enterText(
      find.widgetWithText(TextField, 'Current Password'),
      'current-secret',
    );
    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();

    expect(repository.lastEmail, 'new@example.com');
    expect(repository.lastCurrentPassword, 'current-secret');
    expect(saved?.emailVerified, isFalse);
    expect(verifyEmail, 'new@example.com');
    expect(find.text('Edit profile'), findsNothing);
  });

  testWidgets('asks for the current password only when the email changes', (
    tester,
  ) async {
    await openEdit(tester);
    final password = find.widgetWithText(TextField, 'Current Password');
    final email = find.widgetWithText(TextField, 'sara@example.com');

    expect(password, findsNothing);
    await tester.enterText(email, 'SARA@example.com');
    await tester.pump();
    expect(password, findsNothing);

    await tester.enterText(
      find.widgetWithText(TextField, 'SARA@example.com'),
      'new@example.com',
    );
    await tester.pump();
    expect(password, findsOneWidget);
    expect(find.text('Required to change your email.'), findsOneWidget);
  });

  testWidgets('changing the phone routes to phone verification', (
    tester,
  ) async {
    await openEdit(tester);

    await tester.enterText(
      find.widgetWithText(TextField, '+963900000000'),
      '+963911111111',
    );
    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();

    expect(verifyPhone, '+963911111111');
    expect(verifyEmail, isNull);
    expect(find.text('Edit profile'), findsNothing);
  });

  testWidgets('a failed save stays on the screen and shows the error', (
    tester,
  ) async {
    repository.updateError = const ApiException(
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'boom',
    );
    await openEdit(tester);

    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();

    expect(find.text('Edit profile'), findsOneWidget);
    expect(
      find.text('Something went wrong. Please try again.'),
      findsOneWidget,
    );
    expect(verifyEmail, isNull);
  });
}
