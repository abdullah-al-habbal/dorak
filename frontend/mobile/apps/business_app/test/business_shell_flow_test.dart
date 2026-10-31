import 'package:business_app/src/core/navigation/app.router.dart';
import 'package:business_app/src/core/navigation/app_routes.entity.dart';
import 'package:business_app/src/features/affiliations/business_affiliations.screen.dart';
import 'package:business_app/src/features/floor_plan/business_floor_plan.screen.dart';
import 'package:business_app/src/features/jobs/business_applicants.screen.dart';
import 'package:business_app/src/features/jobs/business_job_form.screen.dart';
import 'package:business_app/src/features/jobs/business_jobs.screen.dart';
import 'package:business_app/src/features/profile/business_profile.screen.dart';
import 'package:business_app/src/features/reviews/business_reviews.screen.dart';
import 'package:business_app/src/features/auth/business_login.screen.dart';
import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/barbers/manual_barber.screen.dart';
import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.screen.dart';
import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'helpers/business_fakes.dart';
import 'helpers/pagination_fixtures.dart';

class _FakeStaffAuth implements StaffAuthRepository {
  @override
  Future<String> login({
    required String email,
    required String password,
  }) async => 'branch-token';
}

class _MemoryTokenStorage implements TokenStorage {
  String? token;

  @override
  Future<void> clear() async => token = null;

  @override
  Future<String?> read() async => token;

  @override
  Future<void> write(String value) async => token = value;
}

class _IdleOperationsRepository implements BranchOperationsRepository {
  @override
  Future<BranchDto> getProfile() async => const BranchDto(
    id: 'branch-1',
    name: 'Branch',
    email: 'branch@example.com',
    status: 'active',
    latitude: 0,
    longitude: 0,
    brandId: 'brand-1',
  );

  @override
  Future<BranchDashboardDto> getDashboard() async => const BranchDashboardDto(
    todayRevenue: 0,
    monthlyRevenue: 0,
    todayBookings: 0,
    activeChairs: 0,
    totalChairs: 0,
    chairStatusCounts: {},
    assignedBranches: [AssignedBranchDto(id: 'branch-1', name: 'Branch')],
  );

  @override
  Future<PaginatedData<BookingDto>> getBookings() async =>
      const PaginatedData(data: [], meta: PaginationFixtures.emptyPage);

  @override
  Future<PaginatedData<FloorChairDto>> getChairs() async =>
      const PaginatedData(data: [], meta: PaginationFixtures.emptyPage);

  @override
  Future<BookingDto> updateBookingStatus(String id, BookingStatus status) =>
      throw UnimplementedError();

  @override
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? comment,
  }) => throw UnimplementedError();

  @override
  Future<FloorChairDto> updateChairStatus(
    String id,
    ChairStatus status, {
    bool force = false,
  }) => throw UnimplementedError();
}

class _UnusedManagedBarberRepository implements ManagedBarberRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

void main() {
  late _MemoryTokenStorage storage;
  late StaffSessionBloc session;
  late BranchOperationsBloc operations;
  late ManualBarberBloc barbers;

  setUp(() {
    storage = _MemoryTokenStorage();
    session = StaffSessionBloc(_FakeStaffAuth(), storage);
    operations = BranchOperationsBloc(_IdleOperationsRepository());
    barbers = ManualBarberBloc(_UnusedManagedBarberRepository());
  });

  tearDown(() async {
    await session.close();
    await operations.close();
    await barbers.close();
  });

  Future<BusinessAppRouter> pumpApp(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    final features = featureBlocsFor();
    addTearDown(features.close);
    late final BusinessAppRouter router;
    router = BusinessAppRouter(
      operations: operations,
      features: features,
      barbers: barbers,
      session: session,
      onLocaleToggle: () {},
      onLogout: () {},
      onAuthenticated: () => router.router.go('/operations'),
    );
    addTearDown(router.dispose);
    await session.restore();
    await tester.pumpWidget(
      MaterialApp.router(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        routerConfig: router.router,
        builder: (context, child) => MultiBlocProvider(
          providers: [
            BlocProvider.value(value: session),
            BlocProvider.value(value: operations),
            BlocProvider.value(value: barbers),
          ],
          child: child!,
        ),
      ),
    );
    await tester.pumpAndSettle();
    return router;
  }

  testWidgets('with no token the app lands on /login', (tester) async {
    final router = await pumpApp(tester);

    expect(find.byType(BusinessLoginScreen), findsOneWidget);
    expect(router.router.state.matchedLocation, '/login');
  });

  testWidgets('with a token the app lands on /operations', (tester) async {
    storage.token = 'stored-token';

    final router = await pumpApp(tester);

    expect(find.byType(BranchOperationsScreen), findsOneWidget);
    expect(router.router.state.matchedLocation, '/operations');
  });

  testWidgets('a guest cannot open /barbers/new directly', (tester) async {
    final router = await pumpApp(tester);

    router.router.go('/barbers/new');
    await tester.pumpAndSettle();

    expect(find.byType(BusinessLoginScreen), findsOneWidget);
    expect(find.byType(ManualBarberScreen), findsNothing);
  });

  testWidgets('Add barber from operations opens ManualBarberScreen', (
    tester,
  ) async {
    storage.token = 'stored-token';
    await pumpApp(tester);

    await tester.tap(find.byTooltip('Add barber'));
    await tester.pumpAndSettle();

    expect(find.byType(ManualBarberScreen), findsOneWidget);
  });

  testWidgets('a 401 clears the token and redirects to /login', (tester) async {
    storage.token = 'stored-token';
    final router = await pumpApp(tester);
    expect(find.byType(BranchOperationsScreen), findsOneWidget);

    await session.unauthorized();
    router.router.go('/operations');
    await tester.pumpAndSettle();

    expect(storage.token, isNull);
    expect(find.byType(BusinessLoginScreen), findsOneWidget);
  });

  testWidgets('every feature route opens behind the session guard', (
    tester,
  ) async {
    final router = await pumpApp(tester);
    final routes = {
      AppRoutes.jobs: BusinessJobsScreen,
      AppRoutes.newJob: BusinessJobFormScreen,
      AppRoutes.editJob('job-1'): BusinessJobFormScreen,
      AppRoutes.applicants('job-1'): BusinessApplicantsScreen,
      AppRoutes.floorPlan: BusinessFloorPlanScreen,
      AppRoutes.affiliations: BusinessAffiliationsScreen,
      AppRoutes.profile: BusinessProfileScreen,
      AppRoutes.reviews: BusinessReviewsScreen,
    };

    for (final path in routes.keys) {
      router.router.go(path);
      await tester.pumpAndSettle();
      expect(find.byType(BusinessLoginScreen), findsOneWidget, reason: path);
    }

    storage.token = 'stored-token';
    await session.restore();
    for (final entry in routes.entries) {
      router.router.go(entry.key);
      await tester.pumpAndSettle();
      expect(find.byType(entry.value), findsOneWidget, reason: entry.key);
    }
  });
}
