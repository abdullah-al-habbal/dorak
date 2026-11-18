import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/navigation/app.router.dart';
import 'package:stylist_app/src/features/auth/stylist_login.screen.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.screen.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';

import 'helpers/sign_up_fakes.dart';
import 'helpers/stylist_fakes.dart';

void main() {
  late FakeBarberRegistrationRepository registration;
  late FakeStaffAuthRepository staffAuth;
  late StylistSignUpBloc signUp;
  late StaffSessionBloc session;

  setUp(() {
    registration = FakeBarberRegistrationRepository();
    staffAuth = FakeStaffAuthRepository();
    signUp = StylistSignUpBloc(registration);
    session = StaffSessionBloc(staffAuth, InMemoryStaffTokenStorage());
  });

  tearDown(() async {
    await signUp.close();
    await session.close();
  });

  Future<StylistAppRouter> pumpApp(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    final repository = FakeStylistOperationsRepository();
    final operations = StylistBloc(repository);
    addTearDown(operations.close);
    final features = featureBlocsFor(repository);
    addTearDown(features.close);
    final router = StylistAppRouter(
      operations: operations,
      features: features,
      session: session,
      signUp: signUp,
      passwordReset: StaffPasswordResetBloc(staffAuth),
      onLocaleToggle: () {},
      onLogout: () {},
      onAccountDeleted: () {},
      onAuthenticated: () {},
    );
    addTearDown(router.dispose);
    await session.restore();
    await tester.pumpWidget(
      MaterialApp.router(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        routerConfig: router.router,
        builder: (context, child) =>
            BlocProvider.value(value: session, child: child!),
      ),
    );
    await tester.pumpAndSettle();
    return router;
  }

  Future<void> fillForm(WidgetTester tester) async {
    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'Omar Fade');
    await tester.enterText(fields.at(1), 'omar@example.com');
    await tester.enterText(fields.at(2), 'secret-pass-1');
    await tester.enterText(fields.at(3), 'secret-pass-1');
    await tester.tap(find.text('Create Account'));
    await tester.pumpAndSettle();
  }

  testWidgets('a guest reaches sign-up from login and ends awaiting approval', (
    tester,
  ) async {
    await pumpApp(tester);
    expect(find.byType(StylistLoginScreen), findsOneWidget);

    await tester.tap(find.text('New to Dorak? Create a stylist account'));
    await tester.pumpAndSettle();
    expect(find.byType(StylistSignUpScreen), findsOneWidget);

    await fillForm(tester);
    expect(registration.registeredPayload?['email'], 'omar@example.com');
    expect(registration.registeredPayload?['is_freelancer'], isTrue);
    expect(find.text('Verify Your Account'), findsOneWidget);

    await tester.enterText(find.byType(TextFormField), '123456');
    await tester.tap(find.text('Verify & Continue'));
    await tester.pumpAndSettle();

    expect(registration.verifiedCode, '123456');
    expect(find.text('Awaiting approval'), findsOneWidget);

    await tester.tap(find.text('Back to sign in'));
    await tester.pumpAndSettle();

    expect(find.byType(StylistLoginScreen), findsOneWidget);
    expect(
      signUp.state.onboardingToken,
      isNull,
      reason: 'the onboarding token must not outlive the sign-up flow',
    );
    expect(session.state.isAuthenticated, isFalse);
  });

  testWidgets('a taken email is explained on the form', (tester) async {
    registration.registerError = fieldRejected('email');
    final router = await pumpApp(tester);
    router.router.go('/signup');
    await tester.pumpAndSettle();

    await fillForm(tester);

    expect(find.byType(StylistSignUpScreen), findsOneWidget);
    expect(
      find.text('An account with this email already exists.'),
      findsOneWidget,
    );
  });

  testWidgets('mismatched passwords never reach the API', (tester) async {
    final router = await pumpApp(tester);
    router.router.go('/signup');
    await tester.pumpAndSettle();

    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'Omar Fade');
    await tester.enterText(fields.at(1), 'omar@example.com');
    await tester.enterText(fields.at(2), 'secret-pass-1');
    await tester.enterText(fields.at(3), 'different-pass');
    await tester.tap(find.text('Create Account'));
    await tester.pumpAndSettle();

    expect(find.text('Passwords do not match'), findsOneWidget);
    expect(registration.registeredPayload, isNull);
  });

  testWidgets('a pending account explains why login is refused', (
    tester,
  ) async {
    staffAuth.loginError = const ApiException(
      statusCode: 403,
      code: 'ACCOUNT_NOT_ACTIVE',
      message: 'activation::messages.account_not_active',
    );
    await pumpApp(tester);

    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'omar@example.com');
    await tester.enterText(fields.at(1), 'secret-pass-1');
    await tester.tap(find.text('Log In'));
    await tester.pumpAndSettle();

    expect(
      find.text(
        'This account is not active. Complete verification or contact support.',
      ),
      findsOneWidget,
    );
  });
}
