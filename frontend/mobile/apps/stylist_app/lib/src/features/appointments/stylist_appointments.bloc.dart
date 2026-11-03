import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/appointments/stylist_appointments.state.dart';

class StylistAppointmentsBloc extends Cubit<StylistAppointmentsState> {
  StylistAppointmentsBloc(this._repository)
    : super(const StylistAppointmentsState());

  final StylistAppointmentRepository _repository;

  Future<void> load() async {
    if (state.page.isBusy) return;
    emit(
      state.copyWith(
        page: state.page.items.isEmpty
            ? state.page.loadingFirst()
            : state.page.refreshing(),
      ),
    );
    try {
      final page = await _repository.getAppointments(status: state.status);
      if (isClosed) return;
      emit(state.copyWith(page: state.page.succeeded(page)));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(page: state.page.failed(error)));
    }
  }

  Future<void> loadMore() async {
    if (!state.page.hasMore || state.page.isBusy) return;
    emit(state.copyWith(page: state.page.loadingMore()));
    try {
      final page = await _repository.getAppointments(
        status: state.status,
        page: state.page.meta.currentPage + 1,
      );
      if (isClosed) return;
      emit(state.copyWith(page: state.page.succeeded(page)));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(page: state.page.failed(error)));
    }
  }

  /// Switches the status filter (null = all) and reloads from the first page.
  Future<void> filter(BookingStatus? status) async {
    if (status == state.status && state.page.items.isNotEmpty) return;
    emit(
      StylistAppointmentsState(
        status: status,
        page: const Paged<BookingDto>.initial(),
      ),
    );
    await load();
  }
}
