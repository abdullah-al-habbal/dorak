import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'helpers/pagination_fixtures.dart';

class _FakeRealtime implements RealtimeClient {
  void Function(String event, Map<String, dynamic> payload)? branchListener;

  @override
  RealtimeSubscription subscribeToBranch(
    String branchId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) {
    branchListener = onEvent;
    return RealtimeSubscription.fromCancel(() {});
  }

  @override
  RealtimeSubscription subscribeToBarber(
    String barberId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) => throw UnimplementedError();

  @override
  RealtimeSubscription subscribeToClient(
    String clientId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) => throw UnimplementedError();

  @override
  bool get isConnected => false;

  @override
  Stream<bool> get connectionChanges => const Stream<bool>.empty();

  @override
  Future<void> connect() async {}

  @override
  Future<void> disconnectForLogout() async {}

  @override
  void dispose() {}
}

class _CountingRepository implements BranchOperationsRepository {
  int bookingLoads = 0;

  @override
  Future<BranchDto> getProfile() async => const BranchDto(
    id: 'branch-1',
    name: 'Branch',
    email: 'branch@example.com',
    status: BranchStatus.enabled,
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
  Future<PaginatedData<BookingDto>> getBookings() async {
    bookingLoads++;
    return const PaginatedData(data: [], meta: PaginationFixtures.emptyPage);
  }

  @override
  Future<PaginatedData<FloorChairDto>> getChairs() async =>
      const PaginatedData(data: [], meta: PaginationFixtures.emptyPage);

  @override
  Future<BookingDto> updateBookingStatus(String id, BookingStatus status) =>
      throw UnimplementedError();

  @override
  Future<FloorChairDto> updateChairStatus(
    String id,
    ChairStatus status, {
    bool force = false,
  }) => throw UnimplementedError();

  @override
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? body,
  }) => throw UnimplementedError();
}

void main() {
  late _CountingRepository repository;
  late _FakeRealtime realtime;
  late BranchOperationsBloc bloc;

  setUp(() async {
    repository = _CountingRepository();
    realtime = _FakeRealtime();
    bloc = BranchOperationsBloc(repository, realtime: realtime);
    await bloc.load();
  });

  tearDown(() => bloc.close());

  for (final event in [
    'booking.created',
    'booking.status.updated',
    'booking.cancelled',
    'booking.rescheduled',
  ]) {
    test('reloads bookings on $event', () async {
      expect(repository.bookingLoads, 1);

      realtime.branchListener!(event, const {});
      await Future<void>.delayed(Duration.zero);

      expect(repository.bookingLoads, 2);
    });
  }

  test('ignores unrelated realtime events', () async {
    realtime.branchListener!('chair.updated', const {});
    await Future<void>.delayed(Duration.zero);

    expect(repository.bookingLoads, 1);
  });
}
