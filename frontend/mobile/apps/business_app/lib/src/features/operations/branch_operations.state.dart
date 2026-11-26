import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class PendingChairMaintenance extends Equatable {
  const PendingChairMaintenance({
    required this.chairId,
    required this.bookingCount,
  });

  final String chairId;
  final int bookingCount;

  @override
  List<Object?> get props => [chairId, bookingCount];
}

class BranchOperationsState extends Equatable {
  BranchOperationsState({
    this.loading = false,
    this.dashboard,
    this.profile,
    List<BookingDto> bookings = const [],
    List<FloorChairDto> chairs = const [],
    this.error,
    this.isUpdateError = false,
    this.pendingMaintenance,
  }) : bookings = List.unmodifiable(bookings),
       chairs = List.unmodifiable(chairs);

  final bool loading;
  final BranchDashboardDto? dashboard;
  final BranchDto? profile;
  final List<BookingDto> bookings;
  final List<FloorChairDto> chairs;
  final Object? error;

  /// Whether [error] came from a chair or booking update rather than a load.
  final bool isUpdateError;
  final PendingChairMaintenance? pendingMaintenance;

  BranchOperationsState copyWith({
    bool? loading,
    BranchDashboardDto? dashboard,
    BranchDto? profile,
    List<BookingDto>? bookings,
    List<FloorChairDto>? chairs,
    Object? error,
    bool? isUpdateError,
    PendingChairMaintenance? pendingMaintenance,
    bool clearError = false,
    bool clearPendingMaintenance = false,
  }) => BranchOperationsState(
    loading: loading ?? this.loading,
    dashboard: dashboard ?? this.dashboard,
    profile: profile ?? this.profile,
    bookings: bookings ?? this.bookings,
    chairs: chairs ?? this.chairs,
    error: clearError ? null : error ?? this.error,
    isUpdateError: isUpdateError ?? this.isUpdateError,
    pendingMaintenance: clearPendingMaintenance
        ? null
        : pendingMaintenance ?? this.pendingMaintenance,
  );

  @override
  List<Object?> get props => [
    loading,
    dashboard,
    profile,
    bookings,
    chairs,
    error,
    isUpdateError,
    pendingMaintenance,
  ];
}
