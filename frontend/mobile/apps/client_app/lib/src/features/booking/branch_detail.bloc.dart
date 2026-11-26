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
    this._preferences, {
    String Function() idempotencyKeyFactory = IdempotencyKey.generate,
  }) : _newIdempotencyKey = idempotencyKeyFactory,
       super(BranchDetailState()) {
    on<BranchDetailStarted>(_onStarted);
    on<BranchDetailChairSelected>(_onChairSelected);
    on<BranchDetailServicesChanged>(_onServicesChanged);
    on<BranchDetailBookingModeChanged>(_onBookingModeChanged);
    on<BranchDetailAtHomeAddressChanged>(_onAtHomeAddressChanged);
    on<BranchDetailSavedAddressSelected>(_onSavedAddressSelected);
    on<BranchDetailBarberPreferenceChanged>(_onBarberPreferenceChanged);
    on<BranchDetailAtHomeLocationRequested>(_onAtHomeLocationRequested);
    on<BranchDetailDateChanged>(_onDateChanged);
    on<BranchDetailSlotSelected>(_onSlotSelected);
    on<BranchDetailBookingSubmitted>(_onSubmitted);
    on<BranchDetailRetried>(_onRetried);
  }

  final ExploreRepository _explore;
  final BranchRepository _branches;
  final BookingRepository _bookings;
  final LocationProvider _location;
  final AppPreferences _preferences;
  final String Function() _newIdempotencyKey;

  /// The key of the submission that has not succeeded yet. A retry of the same
  /// request reuses it, so a booking the server already created is returned
  /// instead of failing as a double booking; changing anything starts a new one.
  ({String key, String fingerprint})? _pendingSubmission;

  int _slotsRequestId = 0;

  Future<void> _onStarted(
    BranchDetailStarted event,
    Emitter<BranchDetailState> emit,
  ) async {
    emit(
      BranchDetailState().copyWith(
        branchId: event.branchId,
        isLoading: true,
        preferredBarberId: event.barberId,
        selectedServiceIds: event.serviceIds,
      ),
    );
    try {
      final detail = await _explore.getBranchDetail(event.branchId);
      if (emit.isDone) return;
      FloorPlanDto? plan;
      Object? planError;
      try {
        plan = await _branches.getFloorPlan(
          event.branchId,
          startsAt: _defaultAvailabilityTime(),
          durationMinutes: 30,
        );
      } catch (error) {
        planError = error;
      }
      if (emit.isDone) return;
      emit(
        state.copyWith(
          isLoading: false,
          detail: detail,
          plan: plan,
          planError: planError,
          clearPlanError: planError == null,
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
  ) async {
    emit(
      state.copyWith(
        preferredBarberId: event.barberId,
        clearPreferredBarber: event.barberId == null,
        clearSubmitError: true,
      ),
    );
    await _loadSlots(emit);
  }

  void _onChairSelected(
    BranchDetailChairSelected event,
    Emitter<BranchDetailState> emit,
  ) async {
    if (event.chairId == null) {
      emit(state.copyWith(clearChair: true, clearSubmitError: true));
    } else {
      emit(
        state.copyWith(selectedChairId: event.chairId, clearSubmitError: true),
      );
    }
    await _loadSlots(emit);
  }

  void _onServicesChanged(
    BranchDetailServicesChanged event,
    Emitter<BranchDetailState> emit,
  ) async {
    emit(
      state.copyWith(
        selectedServiceIds: List<String>.unmodifiable(event.serviceIds),
        clearSubmitError: true,
      ),
    );
    await _loadSlots(emit);
  }

  void _onBookingModeChanged(
    BranchDetailBookingModeChanged event,
    Emitter<BranchDetailState> emit,
  ) async {
    emit(
      state.copyWith(
        isAtHomeBooking: event.isAtHome,
        clearChair: event.isAtHome,
        clearSubmitError: true,
      ),
    );
    await _loadSlots(emit);
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
      if (state.isAtHomeBooking) await _loadSlots(emit);
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(isLocating: false, submitError: error));
    }
  }

  Future<void> _onDateChanged(
    BranchDetailDateChanged event,
    Emitter<BranchDetailState> emit,
  ) async {
    if (event.date == null) {
      emit(
        state.copyWith(
          clearDate: true,
          clearTime: true,
          clearSubmitError: true,
        ),
      );
      await _loadSlots(emit);
      return;
    }
    emit(
      state.copyWith(
        selectedDate: event.date,
        clearTime: true,
        clearSubmitError: true,
      ),
    );
    await _loadSlots(emit);
  }

  Future<void> _onSlotSelected(
    BranchDetailSlotSelected event,
    Emitter<BranchDetailState> emit,
  ) async {
    final startsAt = event.startsAt;
    if (startsAt == null) {
      emit(state.copyWith(clearTime: true, clearSubmitError: true));
      return;
    }
    emit(state.copyWith(selectedTime: startsAt, clearSubmitError: true));
    final branchId = state.branchId;
    if (branchId == null || state.isAtHomeBooking) return;
    try {
      final plan = await _branches.getFloorPlan(
        branchId,
        startsAt: startsAt,
        durationMinutes: _selectedDuration(),
      );
      if (emit.isDone) return;
      emit(state.copyWith(plan: plan, clearPlanError: true));
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(planError: error));
    }
  }

  Future<void> _loadSlots(Emitter<BranchDetailState> emit) async {
    final requestId = ++_slotsRequestId;
    final branchId = state.branchId;
    final date = state.selectedDate;
    final serviceIds = state.selectedServiceIds;
    if (branchId == null || date == null || serviceIds.isEmpty) {
      emit(state.copyWith(slots: const [], isLoadingSlots: false));
      return;
    }

    emit(state.copyWith(isLoadingSlots: true, clearSlotsError: true));
    try {
      final List<SlotDto> slots;
      if (state.isAtHomeBooking) {
        final barberId = state.preferredBarberId;
        if (barberId == null) {
          emit(state.copyWith(slots: const [], isLoadingSlots: false));
          return;
        }
        slots = await _bookings.getBarberSlots(
          barberId,
          date: date,
          serviceIds: serviceIds,
          atHomeLatitude: state.atHomeLatitude,
          atHomeLongitude: state.atHomeLongitude,
        );
      } else {
        final chairId = state.selectedChairId;
        if (chairId == null && state.preferredBarberId == null) {
          emit(state.copyWith(slots: const [], isLoadingSlots: false));
          return;
        }
        slots = await _branches.getBranchSlots(
          branchId,
          date: date,
          serviceIds: serviceIds,
          chairId: chairId,
          barberId: state.preferredBarberId,
        );
      }
      if (emit.isDone || requestId != _slotsRequestId) return;
      final time = state.selectedTime;
      final keepTime =
          time != null &&
          slots.any((slot) => slot.startsAt.isAtSameMomentAs(time));
      emit(
        state.copyWith(
          slots: slots,
          isLoadingSlots: false,
          clearTime: !keepTime,
        ),
      );
    } catch (error) {
      if (emit.isDone || requestId != _slotsRequestId) return;
      emit(
        state.copyWith(
          slots: const [],
          isLoadingSlots: false,
          slotsError: error,
        ),
      );
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
      final isBarberOnly = !state.isAtHomeBooking && chairId == null;
      final idempotencyKey = _idempotencyKeyFor(
        chairId: chairId,
        branchId: isBarberOnly ? state.branchId : null,
        barberId: barberId,
        startsAt: time,
      );
      await _bookings.createBooking(
        idempotencyKey: idempotencyKey,
        chairId: chairId,
        branchId: isBarberOnly ? state.branchId : null,
        barberId: barberId,
        startsAt: time,
        serviceIds: state.selectedServiceIds,
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
      _pendingSubmission = null;
      if (emit.isDone) return;
      emit(state.copyWith(isSubmitting: false, succeeded: true));
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(isSubmitting: false, submitError: error));
    }
  }

  String _idempotencyKeyFor({
    required String? chairId,
    required String? branchId,
    required String? barberId,
    required DateTime startsAt,
  }) {
    final fingerprint = [
      chairId,
      branchId,
      barberId,
      startsAt.toUtc().toIso8601String(),
      (List.of(state.selectedServiceIds)..sort()).join(','),
      if (state.isAtHomeBooking) ...[
        state.atHomeStreet.trim(),
        state.atHomeBuilding.trim(),
        state.atHomeUnit.trim(),
        state.atHomeLatitude,
        state.atHomeLongitude,
      ],
    ].join('|');
    final pending = _pendingSubmission;
    if (pending != null && pending.fingerprint == fingerprint) {
      return pending.key;
    }
    final key = _newIdempotencyKey();
    _pendingSubmission = (key: key, fingerprint: fingerprint);
    return key;
  }

  Future<void> _onRetried(
    BranchDetailRetried event,
    Emitter<BranchDetailState> emit,
  ) async {
    final branchId = state.branchId;
    if (branchId == null) return;
    await _onStarted(
      BranchDetailStarted(
        branchId,
        barberId: state.preferredBarberId,
        serviceIds: state.selectedServiceIds,
      ),
      emit,
    );
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
              (total, service) => total + (service.durationMinutes ?? 0),
            ) ??
        0;
    return duration > 0 ? duration : 30;
  }

  DateTime _defaultAvailabilityTime() {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day, now.hour + 1);
  }
}
