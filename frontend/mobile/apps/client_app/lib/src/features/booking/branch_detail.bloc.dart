import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/booking/branch_detail.event.dart';
import 'package:client_app/src/features/booking/branch_detail.state.dart';

class BranchDetailBloc extends Bloc<BranchDetailEvent, BranchDetailState> {
  BranchDetailBloc(
    this._explore,
    this._branches,
    this._bookings,
    this._location,
    this._preferences,
  ) : super(BranchDetailState()) {
    on<BranchDetailStarted>(_onStarted);
    on<BranchDetailChairSelected>(_onChairSelected);
    on<BranchDetailServicesChanged>(_onServicesChanged);
    on<BranchDetailBookingModeChanged>(_onBookingModeChanged);
    on<BranchDetailAtHomeAddressChanged>(_onAtHomeAddressChanged);
    on<BranchDetailSavedAddressSelected>(_onSavedAddressSelected);
    on<BranchDetailBarberPreferenceChanged>(_onBarberPreferenceChanged);
    on<BranchDetailAtHomeLocationRequested>(_onAtHomeLocationRequested);
    on<BranchDetailTimeChanged>(_onTimeChanged);
    on<BranchDetailBookingSubmitted>(_onSubmitted);
    on<BranchDetailRetried>(_onRetried);
  }

  final ExploreRepository _explore;
  final BranchRepository _branches;
  final BookingRepository _bookings;
  final LocationProvider _location;
  final AppPreferences _preferences;

  Future<void> _onStarted(
    BranchDetailStarted event,
    Emitter<BranchDetailState> emit,
  ) async {
    emit(
      BranchDetailState().copyWith(branchId: event.branchId, isLoading: true),
    );
    try {
      final detail = await _explore.getBranchDetail(event.branchId);
      if (emit.isDone) return;
      FloorPlanDto? plan;
      var planFailed = false;
      try {
        plan = await _branches.getFloorPlan(
          event.branchId,
          timeSlot: _defaultAvailabilityTime(),
          durationMinutes: 30,
        );
      } catch (_) {
        planFailed = true;
      }
      if (emit.isDone) return;
      emit(
        state.copyWith(
          isLoading: false,
          detail: detail,
          plan: plan,
          planFailed: planFailed,
          savedAddresses: _preferences.savedAddresses,
        ),
      );
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(isLoading: false, error: error));
    }
  }

  void _onSavedAddressSelected(
    BranchDetailSavedAddressSelected event,
    Emitter<BranchDetailState> emit,
  ) {
    final address = event.address;
    emit(
      state.copyWith(
        atHomeStreet: address.street,
        atHomeBuilding: address.building,
        atHomeUnit: address.unit,
        atHomeLatitude: address.latitude,
        atHomeLongitude: address.longitude,
        clearSubmitError: true,
      ),
    );
  }

  void _onBarberPreferenceChanged(
    BranchDetailBarberPreferenceChanged event,
    Emitter<BranchDetailState> emit,
  ) {
    emit(
      state.copyWith(
        preferredBarberId: event.barberId,
        clearPreferredBarber: event.barberId == null,
        clearSubmitError: true,
      ),
    );
  }

  void _onChairSelected(
    BranchDetailChairSelected event,
    Emitter<BranchDetailState> emit,
  ) {
    if (event.chairId == null) {
      emit(state.copyWith(clearChair: true, clearSubmitError: true));
    } else {
      emit(
        state.copyWith(selectedChairId: event.chairId, clearSubmitError: true),
      );
    }
  }

  void _onServicesChanged(
    BranchDetailServicesChanged event,
    Emitter<BranchDetailState> emit,
  ) {
    emit(
      state.copyWith(
        selectedServiceIds: List<String>.unmodifiable(event.serviceIds),
        clearSubmitError: true,
      ),
    );
  }

  void _onBookingModeChanged(
    BranchDetailBookingModeChanged event,
    Emitter<BranchDetailState> emit,
  ) {
    emit(
      state.copyWith(
        isAtHomeBooking: event.isAtHome,
        clearChair: event.isAtHome,
        clearSubmitError: true,
      ),
    );
  }

  void _onAtHomeAddressChanged(
    BranchDetailAtHomeAddressChanged event,
    Emitter<BranchDetailState> emit,
  ) {
    emit(
      state.copyWith(
        atHomeStreet: event.street,
        atHomeBuilding: event.building,
        atHomeUnit: event.unit,
        clearSubmitError: true,
      ),
    );
  }

  Future<void> _onAtHomeLocationRequested(
    BranchDetailAtHomeLocationRequested event,
    Emitter<BranchDetailState> emit,
  ) async {
    if (state.isLocating) return;
    emit(state.copyWith(isLocating: true, clearSubmitError: true));
    try {
      final permission = await _location.ensurePermission();
      if (permission != LocationPermissionStatus.granted) {
        throw StateError('location_unavailable');
      }
      final position = await _location.getCurrentPosition();
      if (position == null) throw StateError('location_unavailable');
      if (emit.isDone) return;
      emit(
        state.copyWith(
          atHomeLatitude: position.latitude,
          atHomeLongitude: position.longitude,
          isLocating: false,
        ),
      );
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(isLocating: false, submitError: error));
    }
  }

  Future<void> _onTimeChanged(
    BranchDetailTimeChanged event,
    Emitter<BranchDetailState> emit,
  ) async {
    if (event.time == null) {
      emit(state.copyWith(clearTime: true, clearSubmitError: true));
    } else {
      emit(state.copyWith(selectedTime: event.time, clearSubmitError: true));
      final branchId = state.branchId;
      if (branchId == null || state.isAtHomeBooking) return;
      try {
        final plan = await _branches.getFloorPlan(
          branchId,
          timeSlot: event.time!,
          durationMinutes: _selectedDuration(),
        );
        if (emit.isDone) return;
        emit(state.copyWith(plan: plan, planFailed: false));
      } catch (_) {
        if (emit.isDone) return;
        emit(state.copyWith(planFailed: true));
      }
    }
  }

  Future<void> _onSubmitted(
    BranchDetailBookingSubmitted event,
    Emitter<BranchDetailState> emit,
  ) async {
    final time = state.selectedTime;
    if (!state.canSubmit || time == null) return;
    emit(state.copyWith(isSubmitting: true, clearSubmitError: true));
    try {
      final chairId = state.isAtHomeBooking ? null : state.selectedChairId;
      final barberId =
          state.preferredBarberId ??
          (chairId == null ? null : _barberForChair(state.plan, chairId));
      await _bookings.createBooking(
        chairId: chairId,
        barberId: barberId,
        timeSlot: time,
        serviceIds: state.selectedServiceIds.isEmpty
            ? null
            : state.selectedServiceIds,
        atHomeStreet: state.isAtHomeBooking ? state.atHomeStreet.trim() : null,
        atHomeBuilding: state.isAtHomeBooking
            ? state.atHomeBuilding.trim()
            : null,
        atHomeUnit: state.isAtHomeBooking ? state.atHomeUnit.trim() : null,
        atHomeLatitude: state.isAtHomeBooking ? state.atHomeLatitude : null,
        atHomeLongitude: state.isAtHomeBooking ? state.atHomeLongitude : null,
      );
      if (emit.isDone) return;
      if (state.isAtHomeBooking) {
        await _preferences.saveAddress(
          SavedAddress(
            street: state.atHomeStreet.trim(),
            building: state.atHomeBuilding.trim(),
            unit: state.atHomeUnit.trim(),
            latitude: state.atHomeLatitude!,
            longitude: state.atHomeLongitude!,
          ),
        );
      }
      if (emit.isDone) return;
      emit(state.copyWith(isSubmitting: false, succeeded: true));
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(isSubmitting: false, submitError: error));
    }
  }

  Future<void> _onRetried(
    BranchDetailRetried event,
    Emitter<BranchDetailState> emit,
  ) async {
    final branchId = state.branchId;
    if (branchId == null) return;
    await _onStarted(BranchDetailStarted(branchId), emit);
  }

  String? _barberForChair(FloorPlanDto? plan, String chairId) {
    final chairs = plan?.chairs ?? const <FloorChairDto>[];
    for (final chair in chairs) {
      if (chair.id == chairId) return chair.barber?.id;
    }
    return null;
  }

  int _selectedDuration() {
    final selectedIds = state.selectedServiceIds.toSet();
    final duration =
        state.detail?.services
            .where((service) => selectedIds.contains(service.id))
            .fold<int>(
              0,
              (total, service) => total + (service.duration ?? 0),
            ) ??
        0;
    return duration > 0 ? duration : 30;
  }

  DateTime _defaultAvailabilityTime() {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day, now.hour + 1);
  }
}
