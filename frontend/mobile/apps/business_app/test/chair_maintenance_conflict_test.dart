import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.state.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

class _ConflictRepository implements BranchOperationsRepository {
  final List<bool> forceFlags = [];

  @override
  Future<FloorChairDto> updateChairStatus(
    String id,
    ChairStatus status, {
    bool force = false,
  }) async {
    forceFlags.add(force);
    if (!force) {
      throw const ChairHasActiveBookingsException(
        statusCode: 409,
        code: ChairHasActiveBookingsException.errorCode,
        message: 'conflict',
        bookingIds: ['booking-1', 'booking-2'],
      );
    }
    return FloorChairDto(id: id, status: status);
  }

  // Reloading after a forced change is not under test; keep it offline.
  @override
  Future<BranchDto> getProfile() async => throw StateError('offline');

  @override
  Future<BranchDashboardDto> getDashboard() async =>
      throw StateError('offline');

  @override
  Future<PaginatedData<BookingDto>> getBookings() async =>
      throw StateError('offline');

  @override
  Future<BookingDto> updateBookingStatus(String id, BookingStatus status) async =>
      throw StateError('offline');

  @override
  Future<PaginatedData<FloorChairDto>> getChairs() async =>
      throw StateError('offline');

  @override
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? comment,
  }) => throw UnimplementedError();
}

void main() {
  test('conflict stores a pending maintenance prompt, not an error', () async {
    final repository = _ConflictRepository();
    final bloc = BranchOperationsBloc(repository);
    final chairsBefore = bloc.state.chairs;

    await bloc.updateChairStatus('chair-1', ChairStatus.maintenance);

    expect(bloc.state.chairs, chairsBefore);
    expect(
      bloc.state.pendingMaintenance,
      const PendingChairMaintenance(chairId: 'chair-1', bookingCount: 2),
    );
    expect(bloc.state.error, isNull);
    await bloc.close();
  });

  test('confirming resends with force and clears the prompt', () async {
    final repository = _ConflictRepository();
    final bloc = BranchOperationsBloc(repository);
    await bloc.updateChairStatus('chair-1', ChairStatus.maintenance);

    await bloc.confirmChairMaintenance();

    expect(repository.forceFlags, [false, true]);
    expect(bloc.state.pendingMaintenance, isNull);
    await bloc.close();
  });

  test('dismissing clears the prompt without resending', () async {
    final repository = _ConflictRepository();
    final bloc = BranchOperationsBloc(repository);
    await bloc.updateChairStatus('chair-1', ChairStatus.maintenance);

    bloc.dismissChairMaintenance();

    expect(repository.forceFlags, [false]);
    expect(bloc.state.pendingMaintenance, isNull);
    await bloc.close();
  });
}
