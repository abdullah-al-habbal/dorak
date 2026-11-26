import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/navigation/app.router.dart';
import 'package:stylist_app/src/core/navigation/app_routes.entity.dart';
import 'package:stylist_app/src/features/auth/stylist_login.screen.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';

import 'helpers/session_http.dart';
import 'helpers/sign_up_fakes.dart';
import 'helpers/stylist_fakes.dart';

/// The wiring `app.dart` uses: an authenticated `ApiClient`, the staff session
/// signals and the real router.
void main() {
  late InMemoryStaffTokenStorage storage;
  late StaffSessionBloc session;
  late StylistAppRouter router;
  late int teardowns;

  Future<void> pumpSignedIn(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);
    teardowns = 0;
    final staffAuth = FakeStaffAuthRepository();
    storage = InMemoryStaffTokenStorage();
    await storage.write('token');
    session = StaffSessionBloc(staffAuth, storage);
    addTearDown(session.close);
    final signUp = StylistSignUpBloc(FakeBarberRegistrationRepository());
    addTearDown(signUp.close);
    final repository = FakeStylistOperationsRepository();
    final operations = StylistBloc(repository);
    addTearDown(operations.close);
    final features = featureBlocsFor(repository);
    addTearDown(features.close);
    router = StylistAppRouter(
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
    router.router.go(AppRoutes.home);
    await tester.pumpAndSettle();
  }

  Future<void> callApi(WidgetTester tester, int status, String code) async {
    final api = sessionApiClient(status, code, storage.read);
    final signals = StaffSessionSignals(
      client: api,
      session: session,
      onSessionEnded: () async {
        teardowns++;
        router.router.go(AppRoutes.login);
      },
    );
    addTearDown(signals.dispose);
    await tester.runAsync(() async {
      try {
        await api.get<void>('/barber/profile', parser: (_) {});
      } on ApiException {
        // The session reaction is what the test asserts.
      }
      await Future<void>.delayed(Duration.zero);
    });
    await tester.pumpAndSettle();
  }

  testWidgets('a ban returns to login and explains the suspension', (
    tester,
  ) async {
    await pumpSignedIn(tester);

    await callApi(tester, 403, 'ACCOUNT_BANNED');

    expect(find.byType(StylistLoginScreen), findsOneWidget);
    expect(find.textContaining('account is suspended'), findsOneWidget);
    expect(await storage.read(), isNull);
    expect(teardowns, 1);
  });

  testWidgets('a feature_not_enabled answer keeps the stylist signed in', (
    tester,
  ) async {
    await pumpSignedIn(tester);

    await callApi(tester, 403, 'feature_not_enabled');

    expect(find.byType(StylistLoginScreen), findsNothing);
    expect(session.state.isAuthenticated, isTrue);
    expect(await storage.read(), 'token');
    expect(teardowns, 0);
  });
}
