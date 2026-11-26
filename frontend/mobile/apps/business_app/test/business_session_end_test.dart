import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/navigation/app.router.dart';
import 'package:business_app/src/core/navigation/app_routes.entity.dart';
import 'package:business_app/src/features/auth/business_login.screen.dart';
import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/owner/app_role.entity.dart';

import 'helpers/business_fakes.dart';
import 'helpers/owner_fakes.dart';
import 'helpers/session_http.dart';

class _MemoryTokenStorage implements TokenStorage {
  String? token = 'token';

  @override
  Future<void> clear() async => token = null;

  @override
  Future<String?> read() async => token;

  @override
  Future<void> write(String value) async => token = value;
}

class _UnusedOperations implements BranchOperationsRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

class _UnusedBarbers implements ManagedBarberRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

/// The wiring `app.dart` uses: an authenticated `ApiClient`, the staff session
/// signals and the real router.
void main() {
  late _MemoryTokenStorage storage;
  late StaffSessionBloc session;
  late BusinessAppRouter router;
  late int teardowns;

  Future<void> pumpSignedIn(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);
    teardowns = 0;
    storage = _MemoryTokenStorage();
    session = StaffSessionBloc(RecordingStaffAuth('x'), storage);
    addTearDown(session.close);
    final operations = BranchOperationsBloc(_UnusedOperations());
    addTearDown(operations.close);
    final barbers = ManualBarberBloc(_UnusedBarbers());
    addTearDown(barbers.close);
    final features = featureBlocsFor();
    addTearDown(features.close);
    final ownerBlocs = ownerBlocsFor(
      FakeOwnerRepository(brand: brandFixture()),
    );
    addTearDown(ownerBlocs.close);
    router = BusinessAppRouter(
      operations: operations,
      features: features,
      barbers: barbers,
      session: session,
      passwordReset: StaffPasswordResetBloc(RecordingStaffAuth('x')),
      onLocaleToggle: () {},
      onLogout: () {},
      onAuthenticated: () {},
      owner: ownerBlocs,
      roles: roleAuthFor()..role = AppRole.owner,
      onRegisterAsOwner: () {},
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
    router.router.go(AppRoutes.ownerHome);
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
        await api.get<void>('/owner/brands', parser: (_) {});
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

    expect(find.byType(BusinessLoginScreen), findsOneWidget);
    expect(find.textContaining('account is suspended'), findsOneWidget);
    expect(storage.token, isNull);
    expect(teardowns, 1);
  });

  for (final code in ['brand_suspended', 'feature_not_enabled']) {
    testWidgets('a $code answer keeps the owner signed in', (tester) async {
      await pumpSignedIn(tester);

      await callApi(tester, 403, code);

      expect(find.byType(BusinessLoginScreen), findsNothing);
      expect(session.state.isAuthenticated, isTrue);
      expect(storage.token, 'token');
      expect(teardowns, 0);
    });
  }
}
