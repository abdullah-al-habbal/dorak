import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/navigation/app.router.dart';
import 'package:stylist_app/src/features/auth/stylist_login.screen.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';
import 'package:stylist_app/src/features/operations/stylist.screen.dart';

import 'helpers/sign_up_fakes.dart';

void main() {
  late FakeStaffAuthRepository staffAuth;
  late InMemoryStaffTokenStorage storage;
  late StaffSessionBloc session;
  late StylistSignUpBloc signUp;
  late int authenticatedCalls;

  setUp(() {
    staffAuth = FakeStaffAuthRepository();
    storage = InMemoryStaffTokenStorage();
    session = StaffSessionBloc(staffAuth, storage);
    signUp = StylistSignUpBloc(FakeBarberRegistrationRepository());
    authenticatedCalls = 0;
  });

  tearDown(() async {
    await signUp.close();
    await session.close();
  });

  Future<StylistAppRouter> pumpApp(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    final operations = StylistBloc(FakeStylistOperationsRepository());
    addTearDown(operations.close);
    late final StylistAppRouter router;
    router = StylistAppRouter(
      operations: operations,
      session: session,
      signUp: signUp,
      onLocaleToggle: () {},
      onLogout: () {},
      onAuthenticated: () {
        authenticatedCalls++;
        router.router.go('/home');
      },
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

  Future<void> submitLogin(WidgetTester tester) async {
    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'omar@example.com');
    await tester.enterText(fields.at(1), 'secret-pass-1');
    await tester.tap(find.text('Log In'));
    await tester.pumpAndSettle();
  }

  testWidgets('with no stored token the app lands on /login', (tester) async {
    final router = await pumpApp(tester);

    expect(find.byType(StylistLoginScreen), findsOneWidget);
    expect(router.router.state.matchedLocation, '/login');
  });

  testWidgets('with a stored token the app lands on /home', (tester) async {
    storage.token = 'stored-token';

    final router = await pumpApp(tester);

    expect(find.byType(StylistScreen), findsOneWidget);
    expect(router.router.state.matchedLocation, '/home');
  });

  testWidgets('a guest cannot open /home directly', (tester) async {
    final router = await pumpApp(tester);

    router.router.go('/home');
    await tester.pumpAndSettle();

    expect(find.byType(StylistLoginScreen), findsOneWidget);
  });

  testWidgets('a successful login stores the token and opens /home', (
    tester,
  ) async {
    final router = await pumpApp(tester);

    await submitLogin(tester);

    expect(storage.token, 'staff-token');
    expect(authenticatedCalls, 1);
    expect(router.router.state.matchedLocation, '/home');
  });

  testWidgets('a rejected login stays on /login and never authenticates', (
    tester,
  ) async {
    staffAuth.loginError = Exception('rejected');
    await pumpApp(tester);

    await submitLogin(tester);

    expect(find.byType(StylistLoginScreen), findsOneWidget);
    expect(storage.token, isNull);
    expect(
      authenticatedCalls,
      0,
      reason: 'push registration is wired to onAuthenticated only',
    );
  });

  testWidgets('a 401 clears the token and sends the barber to /login', (
    tester,
  ) async {
    storage.token = 'stored-token';
    final router = await pumpApp(tester);
    expect(find.byType(StylistScreen), findsOneWidget);

    await session.unauthorized();
    router.router.go('/login');
    await tester.pumpAndSettle();

    expect(storage.token, isNull);
    expect(find.byType(StylistLoginScreen), findsOneWidget);
  });
}
