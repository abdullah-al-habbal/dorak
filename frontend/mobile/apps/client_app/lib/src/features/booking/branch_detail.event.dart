import 'package:equatable/equatable.dart';
import 'package:core/core.dart';

sealed class BranchDetailEvent extends Equatable {
  const BranchDetailEvent();

  @override
  List<Object?> get props => [];
}

class BranchDetailStarted extends BranchDetailEvent {
  const BranchDetailStarted(
    this.branchId, {
    this.barberId,
    this.serviceIds = const [],
  });

  final String branchId;
  final String? barberId;
  final List<String> serviceIds;

  @override
  List<Object?> get props => [branchId, barberId, serviceIds];
}

class BranchDetailChairSelected extends BranchDetailEvent {
  const BranchDetailChairSelected(this.chairId);

  final String? chairId;

  @override
  List<Object?> get props => [chairId];
}

class BranchDetailServicesChanged extends BranchDetailEvent {
  const BranchDetailServicesChanged(this.serviceIds);

  final List<String> serviceIds;

  @override
  List<Object?> get props => [serviceIds];
}

class BranchDetailBookingModeChanged extends BranchDetailEvent {
  const BranchDetailBookingModeChanged(this.isAtHome);

  final bool isAtHome;

  @override
  List<Object?> get props => [isAtHome];
}

class BranchDetailAtHomeAddressChanged extends BranchDetailEvent {
  const BranchDetailAtHomeAddressChanged({
    required this.street,
    required this.building,
    required this.unit,
  });

  final String street;
  final String building;
  final String unit;

  @override
  List<Object?> get props => [street, building, unit];
}

class BranchDetailSavedAddressSelected extends BranchDetailEvent {
  const BranchDetailSavedAddressSelected(this.address);

  final SavedAddress address;

  @override
  List<Object?> get props => [address];
}

class BranchDetailBarberPreferenceChanged extends BranchDetailEvent {
  const BranchDetailBarberPreferenceChanged(this.barberId);

  /// `null` means first available.
  final String? barberId;

  @override
  List<Object?> get props => [barberId];
}

class BranchDetailAtHomeLocationRequested extends BranchDetailEvent {
  const BranchDetailAtHomeLocationRequested();
}

class BranchDetailDateChanged extends BranchDetailEvent {
  const BranchDetailDateChanged(this.date);

  final DateTime? date;

  @override
  List<Object?> get props => [date];
}

class BranchDetailSlotSelected extends BranchDetailEvent {
  const BranchDetailSlotSelected(this.startsAt);

  final DateTime? startsAt;

  @override
  List<Object?> get props => [startsAt];
}

class BranchDetailBookingSubmitted extends BranchDetailEvent {
  const BranchDetailBookingSubmitted();
}

class BranchDetailRetried extends BranchDetailEvent {
  const BranchDetailRetried();
}
