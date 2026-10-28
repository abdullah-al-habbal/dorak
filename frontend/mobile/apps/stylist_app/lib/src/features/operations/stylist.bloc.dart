import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/operations/stylist.state.dart';

class StylistBloc extends Cubit<StylistState> {
  StylistBloc(
    StylistOperationsRepository repository, {
    RealtimeClient? realtime,
  }) : this._(repository, realtime);

  StylistBloc._(this._repository, this._realtime) : super(StylistState());

  final StylistOperationsRepository _repository;
  final RealtimeClient? _realtime;
  RealtimeSubscription? _subscription;
  int _loadGeneration = 0;
  int _onlineGeneration = 0;

  Future<void> load() async {
    final generation = ++_loadGeneration;
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final results = await Future.wait([
        _repository.getTodayAppointments(),
        _repository.getProfile(),
      ]);
      if (isClosed || generation != _loadGeneration) return;
      final page = results[0] as PaginatedData<BookingDto>;
      final profile = results[1] as BarberProfileDto;
      emit(
        state.copyWith(
          loading: false,
          profile: profile,
          appointments: page.data,
          online: profile.workstationOnline,
        ),
      );
      _subscription ??= _realtime?.subscribeToBarber(profile.id, _onRealtime);
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

  Future<void> transitionBooking(String id, BarberBookingAction action) async {
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

  Future<void> cancelBooking(String id, String reason) async {
    final trimmed = reason.trim();
    if (trimmed.isEmpty || state.updatingBookingId != null) return;
    emit(state.copyWith(updatingBookingId: id, clearError: true));
    try {
      await _repository.cancelBooking(id, reason: trimmed);
      if (isClosed) return;
      emit(
        state.copyWith(
          appointments: state.appointments
              .where((booking) => booking.id != id)
              .toList(growable: false),
          clearUpdatingBooking: true,
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(clearUpdatingBooking: true, error: error));
    }
  }

  void _onRealtime(String event, Map<String, dynamic> payload) {
    switch (event) {
      case 'booking.status.updated':
      case 'booking.cancelled':
      case 'booking.rescheduled':
      case 'workstation.status.toggled':
        load();
    }
  }

  @override
  Future<void> close() {
    _subscription?.cancel();
    return super.close();
  }
}
