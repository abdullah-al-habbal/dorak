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

  setUp(() {
    repository = FakeProfileRepository();
    saved = null;
    verifyEmail = null;
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
    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();

    expect(repository.lastEmail, 'new@example.com');
    expect(saved?.emailVerified, isFalse);
    expect(verifyEmail, 'new@example.com');
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
