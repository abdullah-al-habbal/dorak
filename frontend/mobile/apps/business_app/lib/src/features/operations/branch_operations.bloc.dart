import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/operations/branch_operations.state.dart';

class BranchOperationsBloc extends Cubit<BranchOperationsState> {
  BranchOperationsBloc(this._repository) : super(BranchOperationsState());
  final BranchOperationsRepository _repository;
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
}
