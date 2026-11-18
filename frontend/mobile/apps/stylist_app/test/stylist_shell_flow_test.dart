import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/navigation/app.router.dart';
import 'package:stylist_app/src/core/navigation/app_routes.entity.dart';
import 'package:stylist_app/src/features/affiliations/stylist_affiliations.screen.dart';
import 'package:stylist_app/src/features/appointments/stylist_appointments.screen.dart';
import 'package:stylist_app/src/features/earnings/stylist_earnings.screen.dart';
import 'package:stylist_app/src/features/inbox/stylist_inbox.screen.dart';
import 'package:stylist_app/src/features/more/stylist_more.screen.dart';
import 'package:stylist_app/src/features/services/stylist_service_form.screen.dart';
import 'package:stylist_app/src/features/services/stylist_services.screen.dart';
import 'package:stylist_app/src/features/jobs/stylist_applications.screen.dart';
import 'package:stylist_app/src/features/jobs/stylist_job_detail.screen.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.screen.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.screen.dart';
import 'package:stylist_app/src/features/profile/stylist_profile.screen.dart';
import 'package:stylist_app/src/features/schedule/stylist_schedule.screen.dart';
import 'package:stylist_app/src/features/auth/stylist_login.screen.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';
import 'package:stylist_app/src/features/operations/stylist.screen.dart';

import 'helpers/sign_up_fakes.dart';
import 'helpers/stylist_fakes.dart';

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

    final repository = FakeStylistOperationsRepository();
    final operations = StylistBloc(repository);
    addTearDown(operations.close);
    final features = featureBlocsFor(repository);
    addTearDown(features.close);
    late final StylistAppRouter router;
    router = StylistAppRouter(
      operations: operations,
      features: features,
      session: session,
      signUp: signUp,
      passwordReset: StaffPasswordResetBloc(staffAuth),
      onLocaleToggle: () {},
      onLogout: () {},
      onAccountDeleted: () {},
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

  testWidgets('every feature route opens behind the session guard', (
    tester,
  ) async {
    final router = await pumpApp(tester);
    final routes = {
      AppRoutes.schedule: StylistScheduleScreen,
      AppRoutes.portfolio: StylistPortfolioScreen,
      AppRoutes.profile: StylistProfileScreen,
      AppRoutes.affiliations: StylistAffiliationsScreen,
      AppRoutes.jobs: StylistJobsScreen,
      AppRoutes.applications: StylistApplicationsScreen,
      AppRoutes.job('job-1'): StylistJobDetailScreen,
      AppRoutes.history: StylistAppointmentsScreen,
      AppRoutes.earnings: StylistEarningsScreen,
      AppRoutes.inbox: StylistInboxScreen,
      AppRoutes.more: StylistMoreScreen,
      AppRoutes.services: StylistServicesScreen,
      AppRoutes.newService: StylistServiceFormScreen,
      AppRoutes.editService('svc-1'): StylistServiceFormScreen,
    };

    for (final path in routes.keys) {
      router.router.go(path);
      await tester.pumpAndSettle();
      expect(find.byType(StylistLoginScreen), findsOneWidget, reason: path);
    }

    storage.token = 'stored-token';
    await session.restore();
    for (final entry in routes.entries) {
      router.router.go(entry.key);
      await tester.pumpAndSettle();
      expect(find.byType(entry.value), findsOneWidget, reason: entry.key);
    }
  });

  testWidgets('a guest resets a forgotten password and returns to login', (
    tester,
  ) async {
    final router = await pumpApp(tester);

    await tester.tap(find.text('Forgot Password?'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField), 'omar@example.com');
    await tester.tap(find.text('Send Code'));
    await tester.pumpAndSettle();
    expect(staffAuth.forgotEmail, 'omar@example.com');

    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), '12345');
    await tester.enterText(fields.at(1), 'new-password-2');
    await tester.enterText(fields.at(2), 'new-password-2');
    await tester.tap(find.text('Reset Password'));
    await tester.pumpAndSettle();
    expect(find.text('Enter all 6 digits'), findsOneWidget);
    expect(staffAuth.resetCode, isNull);

    await tester.enterText(fields.at(0), '123456');
    await tester.tap(find.text('Reset Password'));
    await tester.pumpAndSettle();
    expect(staffAuth.resetCode, '123456');
    expect(find.text('Password Updated'), findsOneWidget);

    await tester.tap(find.text('Return to Log In'));
    await tester.pumpAndSettle();
    expect(router.router.state.matchedLocation, '/login');
  });

  testWidgets('logging out revokes the server token', (tester) async {
    storage.token = 'stored-token';
    await pumpApp(tester);

    await session.logout();

    expect(staffAuth.loggedOut, isTrue);
    expect(storage.token, isNull);
  });
}
