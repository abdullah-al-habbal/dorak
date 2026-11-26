import 'dart:async';

import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/navigation/app.router.dart';
import 'package:business_app/src/core/owner_feature_blocs.provider.dart';
import 'package:business_app/src/features/auth/business_login.screen.dart';
import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/owner/app_role.entity.dart';
import 'package:business_app/src/features/owner/owner_branches.screen.dart';
import 'package:business_app/src/features/owner/owner_home.bloc.dart';
import 'package:business_app/src/features/owner/owner_home.state.dart';
import 'package:business_app/src/features/session/brand_suspension.provider.dart';

import 'helpers/business_fakes.dart';
import 'helpers/owner_fakes.dart';
import 'helpers/session_http.dart';

typedef _Listener = void Function(String event, Map<String, dynamic> payload);

class _MemoryTokenStorage implements TokenStorage {
  String? token = 'token';

  @override
  Future<void> clear() async => token = null;

  @override
  Future<String?> read() async => token;

  @override
  Future<void> write(String value) async => token = value;
}

class _FakeRealtime implements RealtimeClient {
  final listeners = <String, _Listener>{};

  RealtimeSubscription _listen(String channel, _Listener listener) {
    listeners[channel] = listener;
    return RealtimeSubscription.fromCancel(() => listeners.remove(channel));
  }

  void send(String channel, String event, Map<String, dynamic> payload) =>
      listeners[channel]?.call(event, payload);

  @override
  RealtimeSubscription subscribeToBranch(String id, _Listener onEvent) =>
      _listen('branch.$id', onEvent);

  @override
  RealtimeSubscription subscribeToClient(String id, _Listener onEvent) =>
      _listen('client.$id', onEvent);

  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

class _BranchProfile implements BranchOperationsRepository {
  Completer<void>? gate;

  @override
  Future<BranchDto> getProfile() async {
    await gate?.future;
    return const BranchDto(
      id: 'branch-1',
      name: 'Branch',
      email: 'branch@example.com',
      status: BranchStatus.enabled,
      latitude: 0,
      longitude: 0,
      brandId: 'brand-1',
    );
  }

  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

class _OwnerWithClientId extends FakeOwnerRepository {
  _OwnerWithClientId() : super(branches: [branchFixture()]) {
    brand = brandFixture();
  }

  @override
  Future<OwnerProfileDto> me() async =>
      const OwnerProfileDto(clientId: 'owner-1', isOwner: true);
}

class _UnusedBarbers implements ManagedBarberRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

/// The wiring `app.dart` uses: session signals, the suspension monitor and the
/// real router, with a fake socket.
class _Harness {
  _Harness(this.role);

  final AppRole role;
  final storage = _MemoryTokenStorage();
  final realtime = _FakeRealtime();
  final branch = _BranchProfile();
  final owner = _OwnerWithClientId();
  late final StaffSessionBloc session;
  late final OwnerFeatureBlocs ownerBlocs;
  late final BusinessAppRouter router;
  late BrandSuspensionMonitor monitor;
  late ApiClient api;
  late StaffSessionSignals signals;
  int teardowns = 0;

  Future<void> pump(
    WidgetTester tester, {
    int status = 200,
    String code = '',
    Locale locale = const Locale('en'),
  }) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);
    session = StaffSessionBloc(RecordingStaffAuth('x'), storage);
    addTearDown(session.close);
    final operations = BranchOperationsBloc(branch);
    addTearDown(operations.close);
    final barbers = ManualBarberBloc(_UnusedBarbers());
    addTearDown(barbers.close);
    final features = featureBlocsFor();
    addTearDown(features.close);
    ownerBlocs = ownerBlocsFor(owner);
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
      roles: roleAuthFor()..role = role,
      onRegisterAsOwner: () {},
    );
    addTearDown(router.dispose);
    api = sessionApiClient(status, code, storage.read);
    signals = StaffSessionSignals(
      client: api,
      session: session,
      onSessionEnded: () async {
        teardowns++;
        monitor.stop();
        router.router.go('/login');
      },
    );
    addTearDown(signals.dispose);
    monitor = BrandSuspensionMonitor(
      client: api,
      realtime: realtime,
      role: () => role,
      branch: branch,
      owner: owner,
      ownerHome: ownerBlocs.home,
      onBranchSuspended: signals.brandSuspended,
    );
    addTearDown(monitor.dispose);
    await session.restore();
    await tester.pumpWidget(
      MaterialApp.router(
        locale: locale,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        routerConfig: router.router,
        builder: (context, child) => MultiBlocProvider(
          providers: [
            BlocProvider.value(value: session),
            BlocProvider.value(value: operations),
          ],
          child: child!,
        ),
      ),
    );
    await tester.pumpAndSettle();
    await monitor.start();
  }

  Future<void> openOwnerBranches(WidgetTester tester) async {
    router.router.go('/owner');
    await tester.pumpAndSettle();
    router.router.go('/owner/branches');
    await tester.pumpAndSettle();
  }

  Future<void> callApi(WidgetTester tester) async {
    await tester.runAsync(() async {
      try {
        await api.get<void>('/branch/chairs', parser: (_) {});
      } on ApiException {
        // The app's reaction is what the test asserts.
      }
      await Future<void>.delayed(Duration.zero);
    });
    await tester.pumpAndSettle();
  }
}

Future<AppLocalizations> _l10n([String code = 'en']) =>
    AppLocalizations.delegate.load(Locale(code));

void _expectSignedOutWith(_Harness app, String message) {
  expect(find.byType(BusinessLoginScreen), findsOneWidget);
  expect(find.text(message), findsOneWidget);
  expect(app.session.state.isAuthenticated, isFalse);
  expect(app.storage.token, isNull);
}

void main() {
  for (final locale in ['en', 'ar']) {
    testWidgets(
      'the event signs a branch manager out with the reason ($locale)',
      (tester) async {
        final app = _Harness(AppRole.branch);
        await app.pump(tester, locale: Locale(locale));

        app.realtime.send('branch.branch-1', RealtimeEvents.brandSuspended, {
          'brandId': 'brand-1',
          'status': 'suspended',
        });
        await tester.pumpAndSettle();

        _expectSignedOutWith(app, (await _l10n(locale)).businessBrandSuspended);
        expect(app.teardowns, 1);
        expect(app.realtime.listeners, isEmpty);
      },
    );
  }

  testWidgets('another branch event keeps the manager signed in', (
    tester,
  ) async {
    final app = _Harness(AppRole.branch);
    await app.pump(tester);

    app.realtime.send('branch.branch-1', 'booking.created', const {});
    await tester.pumpAndSettle();

    expect(app.session.state.isAuthenticated, isTrue);
    expect(app.teardowns, 0);
  });

  testWidgets('ACCOUNT_NOT_ACTIVE explains why the branch was signed out', (
    tester,
  ) async {
    final app = _Harness(AppRole.branch);
    await app.pump(tester, status: 403, code: 'ACCOUNT_NOT_ACTIVE');

    await app.callApi(tester);

    _expectSignedOutWith(app, (await _l10n()).businessBranchNotActive);
    expect(app.teardowns, 1);
  });

  testWidgets('brand_suspended over HTTP signs a branch manager out', (
    tester,
  ) async {
    final app = _Harness(AppRole.branch);
    await app.pump(tester, status: 403, code: 'brand_suspended');

    await app.callApi(tester);

    _expectSignedOutWith(app, (await _l10n()).businessBrandSuspended);
  });

  testWidgets('the event turns an open owner screen read-only', (tester) async {
    final app = _Harness(AppRole.owner);
    await app.pump(tester);
    await app.openOwnerBranches(tester);
    expect(find.byType(FloatingActionButton), findsOneWidget);

    app.realtime.send('client.owner-1', RealtimeEvents.brandSuspended, {
      'brandId': 'brand-1',
    });
    await tester.pumpAndSettle();

    expect(find.byType(OwnerBranchesScreen), findsOneWidget);
    expect(find.byType(FloatingActionButton), findsNothing);
    expect(tester.widget<Switch>(find.byType(Switch)).onChanged, isNull);
    expect(find.textContaining('nothing can be changed'), findsOneWidget);
    expect(app.session.state.isAuthenticated, isTrue);
    expect(app.teardowns, 0);
  });

  testWidgets('another brand suspension changes nothing for the owner', (
    tester,
  ) async {
    final app = _Harness(AppRole.owner);
    await app.pump(tester);
    await app.openOwnerBranches(tester);

    app.realtime.send('client.owner-1', RealtimeEvents.brandSuspended, {
      'brandId': 'brand-2',
    });
    await tester.pumpAndSettle();

    expect(app.ownerBlocs.home.state.isReadOnly, isFalse);
    expect(find.byType(FloatingActionButton), findsOneWidget);
  });

  testWidgets('brand_suspended over HTTP reloads the owner brand', (
    tester,
  ) async {
    final app = _Harness(AppRole.owner);
    await app.pump(tester, status: 403, code: 'brand_suspended');
    await app.openOwnerBranches(tester);
    app.owner.brand = brandFixture(status: OwnerBrandStatus.suspended);

    await app.callApi(tester);

    expect(find.byType(FloatingActionButton), findsNothing);
    expect(app.session.state.isAuthenticated, isTrue);
    expect(app.storage.token, 'token');
  });

  testWidgets('a session that ends during the id lookup never subscribes', (
    tester,
  ) async {
    final app = _Harness(AppRole.branch);
    await app.pump(tester);
    final gate = app.branch.gate = Completer<void>();

    final starting = app.monitor.start();
    app.monitor.stop();
    gate.complete();
    await starting;

    expect(app.realtime.listeners, isEmpty);
  });

  test('a suspension during a load starts the load again', () async {
    final repository = _GatedOwner();
    final home = OwnerHomeCubit(repository);
    addTearDown(home.close);

    final first = home.load();
    await pumpEventQueue();
    repository.brand = brandFixture(status: OwnerBrandStatus.suspended);
    home.markSuspended('brand-1');
    repository.firstAnswer.complete(brandFixture());
    await first;
    await pumpEventQueue();

    expect(home.state.status, OwnerHomeStatus.ready);
    expect(home.state.isReadOnly, isTrue);
  });
}

/// Holds the first brand answer back, so it can arrive after a newer one.
class _GatedOwner extends FakeOwnerRepository {
  _GatedOwner() {
    brand = brandFixture();
  }

  final firstAnswer = Completer<OwnerBrandDto>();
  bool _first = true;

  @override
  Future<PaginatedData<OwnerBrandDto>> getBrands({int page = 1}) async {
    if (!_first) return super.getBrands(page: page);
    _first = false;
    final stale = await firstAnswer.future;
    final current = await super.getBrands(page: page);
    return PaginatedData(data: [stale], meta: current.meta);
  }
}
