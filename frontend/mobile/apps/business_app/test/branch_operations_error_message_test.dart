import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.screen.dart';

import 'helpers/pagination_fixtures.dart';

const _serverFailure = ApiException(
  statusCode: 500,
  code: 'SERVER_ERROR',
  message: 'raw',
);

class _Repository implements BranchOperationsRepository {
  Object? loadError;

  @override
  Future<BranchDto> getProfile() async {
    final failure = loadError;
    if (failure != null) throw failure;
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
  Future<BranchDashboardDto> getDashboard() async => const BranchDashboardDto(
    todayRevenue: 0,
    monthlyRevenue: 0,
    todayBookings: 0,
    activeChairs: 0,
    totalChairs: 0,
    chairStatusCounts: {},
    assignedBranches: [],
  );

  @override
  Future<PaginatedData<BookingDto>> getBookings() async =>
      const PaginatedData(data: [], meta: PaginationFixtures.emptyPage);

  @override
  Future<PaginatedData<FloorChairDto>> getChairs() async =>
      const PaginatedData(data: [], meta: PaginationFixtures.emptyPage);

  @override
  Future<FloorChairDto> updateChairStatus(
    String id,
    ChairStatus status, {
    bool force = false,
  }) => Future.error(_serverFailure);

  @override
  Future<BookingDto> updateBookingStatus(String id, BookingStatus status) =>
      Future.error(_serverFailure);

  @override
  dynamic noSuchMethod(Invocation invocation) =>
      throw UnimplementedError(invocation.memberName.toString());
}

void main() {
  late _Repository repository;
  late BranchOperationsBloc bloc;
  late AppLocalizations l10n;

  setUp(() async {
    l10n = await AppLocalizations.delegate.load(const Locale('en'));
    repository = _Repository();
    bloc = BranchOperationsBloc(repository);
  });

  tearDown(() => bloc.close());

  Future<void> pumpScreen(WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: BranchOperationsScreen(
          bloc: bloc,
          onLocaleToggle: () {},
          onLogout: () {},
          onAddBarber: () {},
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('a failed load says the screen could not load', (tester) async {
    repository.loadError = _serverFailure;

    await pumpScreen(tester);

    expect(find.text(l10n.businessLoadFailed), findsOneWidget);
    expect(find.text(l10n.businessUpdateFailed), findsNothing);
  });

  final updates = <String, Future<void> Function(BranchOperationsBloc)>{
    'chair': (bloc) => bloc.updateChairStatus('chair-1', ChairStatus.occupied),
    'booking': (bloc) =>
        bloc.updateBooking('booking-1', BookingStatus.completed),
  };

  for (final MapEntry(key: name, value: update) in updates.entries) {
    testWidgets('a failed $name update says it could not save', (tester) async {
      await pumpScreen(tester);

      await update(bloc);
      await tester.pumpAndSettle();

      expect(find.text(l10n.businessUpdateFailed), findsOneWidget);
      expect(find.text(l10n.businessLoadFailed), findsNothing);
    });
  }

  testWidgets('a reload that fails after an update failure says load', (
    tester,
  ) async {
    await pumpScreen(tester);
    await bloc.updateBooking('booking-1', BookingStatus.completed);
    repository.loadError = _serverFailure;

    await bloc.load();
    await tester.pumpAndSettle();

    expect(find.text(l10n.businessLoadFailed), findsOneWidget);
  });
}
