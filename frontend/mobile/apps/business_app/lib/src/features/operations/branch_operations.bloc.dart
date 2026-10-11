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
      final results = await Future.wait([
        _repository.getDashboard(),
        _repository.getBookings(),
        _repository.getChairs(),
      ]);
      if (isClosed || generation != _loadGeneration) return;
      emit(
        BranchOperationsState(
          loading: false,
          dashboard: results[0] as BranchDashboardDto,
          bookings: (results[1] as PaginatedData<BookingDto>).data,
          chairs: (results[2] as PaginatedData<FloorChairDto>).data,
        ),
      );
      if (_realtime != null) {
        for (final branch
            in (results[0] as BranchDashboardDto).assignedBranches) {
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

  Future<void> updateBooking(String id, String status) async {
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
