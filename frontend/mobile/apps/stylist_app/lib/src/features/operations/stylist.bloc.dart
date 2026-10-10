import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/operations/stylist.state.dart';

class StylistBloc extends Cubit<StylistState> {
  StylistBloc(this._repository) : super(StylistState());

  final StylistOperationsRepository _repository;
  int _loadGeneration = 0;
  int _onlineGeneration = 0;

  Future<void> load() async {
    final generation = ++_loadGeneration;
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final page = await _repository.getTodayAppointments();
      if (isClosed || generation != _loadGeneration) return;
      emit(state.copyWith(loading: false, appointments: page.data));
    } catch (error) {
      if (isClosed || generation != _loadGeneration) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  Future<void> setOnline(bool value) async {
    final generation = ++_onlineGeneration;
    emit(state.copyWith(online: value));
    try {
      final online = await _repository.updateWorkstationStatus(value);
      if (isClosed || generation != _onlineGeneration) return;
      emit(state.copyWith(online: online));
    } catch (error) {
      if (isClosed || generation != _onlineGeneration) return;
      emit(state.copyWith(online: !value, error: error));
    }
  }

  Future<void> transitionBooking(String id, String action) async {
    if (state.updatingBookingId != null) return;
    emit(state.copyWith(updatingBookingId: id, clearError: true));
    try {
      final updated = await _repository.transitionBooking(id, action);
      if (isClosed) return;
      emit(
        state.copyWith(
          appointments: state.appointments
              .map((booking) => booking.id == id ? updated : booking)
              .toList(growable: false),
          clearUpdatingBooking: true,
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(clearUpdatingBooking: true, error: error));
    }
  }
}
