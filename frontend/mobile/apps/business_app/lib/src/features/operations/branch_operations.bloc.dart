import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/operations/branch_operations.state.dart';

class BranchOperationsBloc extends Cubit<BranchOperationsState> {
  BranchOperationsBloc(
    BranchOperationsRepository repository, {
    RealtimeClient? realtime,
  }) : this._(repository, realtime);

  BranchOperationsBloc._(this._repository, this._realtime)
    : super(BranchOperationsState());
  final BranchOperationsRepository _repository;
  final RealtimeClient? _realtime;
  final List<RealtimeSubscription> _subscriptions = [];
  final Set<String> _subscribedBranchIds = {};
  int _loadGeneration = 0;

  Future<void> load() async {
    final generation = ++_loadGeneration;
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final profileRequest = _repository.getProfile();
      final dashboardRequest = _repository.getDashboard();
      final bookingsRequest = _repository.getBookings();
      final chairsRequest = _repository.getChairs();
      await Future.wait([
        profileRequest,
        dashboardRequest,
        bookingsRequest,
        chairsRequest,
      ]);
      if (isClosed || generation != _loadGeneration) return;
      final dashboard = await dashboardRequest;
      emit(
        BranchOperationsState(
          loading: false,
          profile: await profileRequest,
          dashboard: dashboard,
          bookings: (await bookingsRequest).data,
          chairs: (await chairsRequest).data,
        ),
      );
      if (_realtime != null) {
        for (final branch in dashboard.assignedBranches) {
          if (_subscribedBranchIds.add(branch.id)) {
            _subscriptions.add(
              _realtime.subscribeToBranch(branch.id, _onRealtime),
            );
          }
        }
      }
    } catch (error) {
      if (isClosed || generation != _loadGeneration) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  Future<void> updateChairStatus(
    String id,
    ChairStatus status, {
    bool force = false,
  }) async {
    try {
      final updated = await _repository.updateChairStatus(
        id,
        status,
        force: force,
      );
      if (isClosed) return;
      emit(
        state.copyWith(
          chairs: state.chairs
              .map((chair) => chair.id == id ? updated : chair)
              .toList(growable: false),
          clearError: true,
          clearPendingMaintenance: true,
        ),
      );
      if (force) await load();
    } on ChairHasActiveBookingsException catch (conflict) {
      if (isClosed) return;
      emit(
        state.copyWith(
          pendingMaintenance: PendingChairMaintenance(
            chairId: id,
            bookingCount: conflict.bookingIds.length,
          ),
        ),
      );
    } catch (error) {
      if (!isClosed) emit(state.copyWith(error: error));
    }
  }

  Future<void> confirmChairMaintenance() async {
    final pending = state.pendingMaintenance;
    if (pending == null) return;
    await updateChairStatus(
      pending.chairId,
      ChairStatus.maintenance,
      force: true,
    );
  }

  void dismissChairMaintenance() {
    emit(state.copyWith(clearPendingMaintenance: true));
  }

  Future<void> updateBooking(String id, BookingStatus status) async {
    try {
      await _repository.updateBookingStatus(id, status);
      if (isClosed) return;
      await load();
    } catch (error) {
      if (!isClosed) emit(state.copyWith(error: error));
    }
  }

  void _onRealtime(String event, Map<String, dynamic> payload) {
    switch (event) {
      case 'booking.created':
      case 'booking.status.updated':
      case 'booking.cancelled':
      case 'booking.rescheduled':
        load();
    }
  }

  @override
  Future<void> close() {
    for (final subscription in _subscriptions) {
      subscription.cancel();
    }
    return super.close();
  }
}
