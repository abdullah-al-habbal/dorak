import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/navigation/app.router.dart';
import 'package:business_app/src/features/auth/business_login.screen.dart';
import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/owner/app_role.entity.dart';
import 'package:business_app/src/features/owner/owner_branches.screen.dart';
import 'package:business_app/src/features/owner/owner_home.screen.dart';

import 'package:business_app/src/features/owner/role_auth.repository.dart';

import 'helpers/business_fakes.dart';
import 'helpers/owner_fakes.dart';

class _MemoryTokenStorage implements TokenStorage {
  String? token;

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

void main() {
  late FakeOwnerRepository owner;
  late int registerTaps;
  late int logoutTaps;
  late _MemoryTokenStorage storage;
  late BusinessAppRouter router;
  late RoleAuthRepository roles;

  Future<void> pumpApp(
    WidgetTester tester, {
    AppRole role = AppRole.owner,
    bool signedIn = true,
    Locale locale = const Locale('en'),
  }) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);
    registerTaps = 0;
    logoutTaps = 0;
    storage = _MemoryTokenStorage()..token = signedIn ? 'token' : null;
    roles = roleAuthFor()..role = role;
    final session = StaffSessionBloc(RecordingStaffAuth('x'), storage);
    addTearDown(session.close);
    final operations = BranchOperationsBloc(_UnusedOperations());
    addTearDown(operations.close);
    final barbers = ManualBarberBloc(_UnusedBarbers());
    addTearDown(barbers.close);
    final features = featureBlocsFor();
    addTearDown(features.close);
    final ownerBlocs = ownerBlocsFor(owner);
    addTearDown(ownerBlocs.close);
    router = BusinessAppRouter(
      operations: operations,
      features: features,
      barbers: barbers,
      session: session,
      passwordReset: StaffPasswordResetBloc(RecordingStaffAuth('x')),
      onLocaleToggle: () {},
      onLogout: () => logoutTaps++,
      onAuthenticated: () {},
      owner: ownerBlocs,
      roles: roles,
      onRegisterAsOwner: () => registerTaps++,
    );
    addTearDown(router.dispose);
    await session.restore();
    await tester.pumpWidget(
      MaterialApp.router(
        locale: locale,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        routerConfig: router.router,
        builder: (context, child) =>
            BlocProvider.value(value: session, child: child!),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('a pending brand shows the approval banner and the menu', (
    tester,
  ) async {
    owner = FakeOwnerRepository(
      brand: brandFixture(status: OwnerBrandStatus.pending),
    );
    await pumpApp(tester);
    router.router.go('/owner');
    await tester.pumpAndSettle();

    expect(find.byType(OwnerHomeScreen), findsOneWidget);
    expect(find.textContaining('waiting for approval'), findsOneWidget);
    expect(find.text('Branches'), findsOneWidget);
    expect(find.text('Send for another review'), findsNothing);
  });

  testWidgets('a suspended brand is announced as read-only', (tester) async {
    owner = FakeOwnerRepository(
      brand: brandFixture(status: OwnerBrandStatus.suspended),
    );
    await pumpApp(tester);
    router.router.go('/owner');
    await tester.pumpAndSettle();

    expect(find.textContaining('nothing can be changed'), findsOneWidget);
  });

  testWidgets('a rejected brand shows the reason and can be resubmitted', (
    tester,
  ) async {
    owner = FakeOwnerRepository(
      brand: brandFixture(
        status: OwnerBrandStatus.rejected,
        reason: 'Blurry logo',
      ),
    );
    await pumpApp(tester);
    router.router.go('/owner');
    await tester.pumpAndSettle();

    expect(find.textContaining('Blurry logo'), findsOneWidget);
    await tester.tap(find.text('Send for another review'));
    await tester.pumpAndSettle();

    expect(owner.calls, ['resubmit:brand-1']);
    expect(find.textContaining('waiting for approval'), findsOneWidget);
  });

  testWidgets('a client with no brand is pointed to the web registration', (
    tester,
  ) async {
    owner = FakeOwnerRepository();
    await pumpApp(tester);
    router.router.go('/owner');
    await tester.pumpAndSettle();

    expect(find.text('No brand on this account'), findsOneWidget);
    await tester.tap(find.text('Register as a brand owner on the website'));
    expect(registerTaps, 1);
  });

  testWidgets('the owner area reads right to left in Arabic', (tester) async {
    owner = FakeOwnerRepository(
      brand: brandFixture(status: OwnerBrandStatus.pending),
    );
    await pumpApp(tester, locale: const Locale('ar'));
    router.router.go('/owner');
    await tester.pumpAndSettle();

    expect(
      Directionality.of(tester.element(find.byType(OwnerHomeScreen))),
      TextDirection.rtl,
    );
    expect(find.textContaining('بانتظار الموافقة'), findsWidgets);
  });

  testWidgets('the owner turns a branch off from the list', (tester) async {
    owner = FakeOwnerRepository(
      brand: brandFixture(),
      branches: [branchFixture()],
    );
    await pumpApp(tester);
    router.router.go('/owner/branches');
    await tester.pumpAndSettle();

    expect(find.byType(OwnerBranchesScreen), findsOneWidget);
    await tester.tap(find.byType(Switch));
    await tester.pumpAndSettle();

    expect(owner.calls, ['switch:branch-1:false']);
  });

  testWidgets('creating a branch from the form calls the API', (tester) async {
    owner = FakeOwnerRepository(brand: brandFixture());
    await pumpApp(tester);
    router.router.go('/owner');
    await tester.pumpAndSettle();
    router.router.go('/owner/branches/new');
    await tester.pumpAndSettle();

    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'Uptown');
    await tester.enterText(fields.at(1), 'أبتاون');
    await tester.enterText(fields.at(2), 'uptown@example.com');
    await tester.enterText(fields.at(3), 'secret-pass');
    await tester.tap(find.text('Save branch'));
    await tester.pumpAndSettle();

    expect(owner.calls, ['create:Uptown:uptown@example.com:secret-pass']);
  });

  testWidgets('a branch account cannot open the owner area', (tester) async {
    owner = FakeOwnerRepository(brand: brandFixture());
    await pumpApp(tester, role: AppRole.branch);

    router.router.go('/owner/branches');
    await tester.pump();
    await tester.pump();

    expect(find.byType(OwnerBranchesScreen), findsNothing);
    expect(router.router.state.matchedLocation, '/operations');
  });

  testWidgets('the login screen offers both roles and the web registration', (
    tester,
  ) async {
    owner = FakeOwnerRepository();
    await pumpApp(tester, signedIn: false, role: AppRole.branch);

    expect(find.byType(BusinessLoginScreen), findsOneWidget);
    expect(find.text('Register as a brand owner on the website'), findsNothing);

    await tester.tap(find.text('Brand owner'));
    await tester.pumpAndSettle();

    expect(roles.role, AppRole.owner);
    await tester.tap(find.text('Register as a brand owner on the website'));
    expect(registerTaps, 1);

    await tester.tap(find.text('Branch account'));
    await tester.pumpAndSettle();
    expect(roles.role, AppRole.branch);
  });
}
