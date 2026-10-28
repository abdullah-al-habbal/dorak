import 'package:equatable/equatable.dart';
import 'package:core/core.dart';

class BranchDetailState extends Equatable {
  BranchDetailState({
    this.branchId,
    this.isLoading = false,
    this.detail,
    this.plan,
    this.error,
    this.planFailed = false,
    this.selectedChairId,
    List<String> selectedServiceIds = const [],
    List<SavedAddress> savedAddresses = const [],
    this.preferredBarberId,
    this.isAtHomeBooking = false,
    this.atHomeStreet = '',
    this.atHomeBuilding = '',
    this.atHomeUnit = '',
    this.atHomeLatitude,
    this.atHomeLongitude,
    this.isLocating = false,
    this.selectedDate,
    List<SlotDto> slots = const [],
    this.isLoadingSlots = false,
    this.slotsError,
    this.selectedTime,
    this.isSubmitting = false,
    this.submitError,
    this.succeeded = false,
  }) : selectedServiceIds = List.unmodifiable(selectedServiceIds),
       savedAddresses = List.unmodifiable(savedAddresses),
       slots = List.unmodifiable(slots);

  final String? branchId;
  final bool isLoading;
  final BranchDetailDto? detail;
  final FloorPlanDto? plan;
  final Object? error;
  final bool planFailed;
  final String? selectedChairId;
  final List<String> selectedServiceIds;
  final List<SavedAddress> savedAddresses;
  final String? preferredBarberId;
  final bool isAtHomeBooking;
  final String atHomeStreet;
  final String atHomeBuilding;
  final String atHomeUnit;
  final double? atHomeLatitude;
  final double? atHomeLongitude;
  final bool isLocating;
  final DateTime? selectedDate;
  final List<SlotDto> slots;
  final bool isLoadingSlots;
  final Object? slotsError;
  final DateTime? selectedTime;
  final bool isSubmitting;
  final Object? submitError;
  final bool succeeded;

  bool get hasSelectedService => selectedServiceIds.isNotEmpty;

  bool get canSubmit {
    if (isSubmitting || isLocating || selectedTime == null) return false;
    if (!hasSelectedService) return false;
    if (!slots.any((slot) => slot.startsAt.isAtSameMomentAs(selectedTime!))) {
      return false;
    }
    if (!isAtHomeBooking) return selectedChairId != null;
    return preferredBarberId != null &&
        atHomeStreet.trim().isNotEmpty &&
        atHomeBuilding.trim().isNotEmpty &&
        atHomeUnit.trim().isNotEmpty &&
        atHomeLatitude != null &&
        atHomeLongitude != null;
  }

  BranchDetailState copyWith({
    String? branchId,
    bool? isLoading,
    BranchDetailDto? detail,
    FloorPlanDto? plan,
    Object? error,
    bool clearError = false,
    bool? planFailed,
    String? selectedChairId,
    bool clearChair = false,
    List<String>? selectedServiceIds,
    List<SavedAddress>? savedAddresses,
    String? preferredBarberId,
    bool clearPreferredBarber = false,
    bool? isAtHomeBooking,
    String? atHomeStreet,
    String? atHomeBuilding,
    String? atHomeUnit,
    double? atHomeLatitude,
    double? atHomeLongitude,
    bool clearAtHomeLocation = false,
    bool? isLocating,
    DateTime? selectedDate,
    bool clearDate = false,
    List<SlotDto>? slots,
    bool? isLoadingSlots,
    Object? slotsError,
    bool clearSlotsError = false,
    DateTime? selectedTime,
    bool clearTime = false,
    bool? isSubmitting,
    Object? submitError,
    bool clearSubmitError = false,
    bool? succeeded,
  }) {
    return BranchDetailState(
      branchId: branchId ?? this.branchId,
      isLoading: isLoading ?? this.isLoading,
      detail: detail ?? this.detail,
      plan: plan ?? this.plan,
      error: clearError ? null : error ?? this.error,
      planFailed: planFailed ?? this.planFailed,
      selectedChairId: clearChair
          ? null
          : selectedChairId ?? this.selectedChairId,
      selectedServiceIds: selectedServiceIds ?? this.selectedServiceIds,
      savedAddresses: savedAddresses ?? this.savedAddresses,
      preferredBarberId: clearPreferredBarber
          ? null
          : preferredBarberId ?? this.preferredBarberId,
      isAtHomeBooking: isAtHomeBooking ?? this.isAtHomeBooking,
      atHomeStreet: atHomeStreet ?? this.atHomeStreet,
      atHomeBuilding: atHomeBuilding ?? this.atHomeBuilding,
      atHomeUnit: atHomeUnit ?? this.atHomeUnit,
      atHomeLatitude: clearAtHomeLocation
          ? null
          : atHomeLatitude ?? this.atHomeLatitude,
      atHomeLongitude: clearAtHomeLocation
          ? null
          : atHomeLongitude ?? this.atHomeLongitude,
      isLocating: isLocating ?? this.isLocating,
      selectedDate: clearDate ? null : selectedDate ?? this.selectedDate,
      slots: slots ?? this.slots,
      isLoadingSlots: isLoadingSlots ?? this.isLoadingSlots,
      slotsError: clearSlotsError ? null : slotsError ?? this.slotsError,
      selectedTime: clearTime ? null : selectedTime ?? this.selectedTime,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      submitError: clearSubmitError ? null : submitError ?? this.submitError,
      succeeded: succeeded ?? this.succeeded,
    );
  }

  @override
  List<Object?> get props => [
    branchId,
    isLoading,
    detail,
    plan,
    error,
    planFailed,
    selectedChairId,
    selectedServiceIds,
    savedAddresses,
    preferredBarberId,
    isAtHomeBooking,
    atHomeStreet,
    atHomeBuilding,
    atHomeUnit,
    atHomeLatitude,
    atHomeLongitude,
    isLocating,
    selectedDate,
    slots,
    isLoadingSlots,
    slotsError,
    selectedTime,
    isSubmitting,
    submitError,
    succeeded,
  ];
}
