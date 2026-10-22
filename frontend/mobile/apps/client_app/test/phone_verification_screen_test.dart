import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/phone_verification.bloc.dart';
import 'package:client_app/src/features/profile/phone_verification.screen.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeProfileRepository repository;
  ClientDto? verified;
  var skipped = false;

  setUp(() {
    repository = FakeProfileRepository();
    verified = null;
    skipped = false;
  });

  Future<void> open(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    final bloc = PhoneVerificationBloc(repository, '+963911222333');
    addTearDown(bloc.close);
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: PhoneVerificationScreen(
          bloc: bloc,
          onVerified: (client) => verified = client,
          onSkip: () => skipped = true,
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('sends a code on open and verifies a correct one', (
    tester,
  ) async {
    await open(tester);

    expect(repository.requestOtpCalls, 1);
    expect(find.textContaining('+963911222333'), findsOneWidget);

    await tester.enterText(find.byType(TextField), '123456');
    await tester.tap(find.text('Verify phone'));
    await tester.pumpAndSettle();

    expect(repository.lastOtpCode, '123456');
    expect(verified?.phoneVerified, isTrue);
  });

  testWidgets('an incomplete code is rejected locally', (tester) async {
    await open(tester);

    await tester.enterText(find.byType(TextField), '123');
    await tester.tap(find.text('Verify phone'));
    await tester.pumpAndSettle();

    expect(repository.verifyOtpCalls, 0);
    expect(find.text('Enter the 6-digit code.'), findsOneWidget);
  });

  testWidgets('a wrong code shows the invalid-code banner', (tester) async {
    repository.verifyOtpError = const ApiException(
      statusCode: 422,
      code: 'UNPROCESSABLE_ENTITY',
      message: 'bad',
    );
    await open(tester);

    await tester.enterText(find.byType(TextField), '000000');
    await tester.tap(find.text('Verify phone'));
    await tester.pumpAndSettle();

    expect(find.text('That code is invalid or has expired.'), findsOneWidget);
    expect(verified, isNull);
  });

  testWidgets('a throttled resend shows the rate-limit message', (
    tester,
  ) async {
    await open(tester);
    repository.requestOtpError = const ApiException(
      statusCode: 429,
      code: 'TOO_MANY_REQUESTS',
      message: 'slow down',
    );

    await tester.tap(find.text('Resend code'));
    await tester.pumpAndSettle();

    expect(repository.requestOtpCalls, 2);
    expect(
      find.text('Too many attempts. Please wait a minute and try again.'),
      findsOneWidget,
    );
  });

  testWidgets('Not now leaves without verifying', (tester) async {
    await open(tester);

    await tester.tap(find.text('Not now'));
    await tester.pumpAndSettle();

    expect(skipped, isTrue);
    expect(repository.verifyOtpCalls, 0);
  });
}
