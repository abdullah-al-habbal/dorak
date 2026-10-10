import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class BranchOperationsState extends Equatable {
  BranchOperationsState({
    this.loading = false,
    this.dashboard,
    List<BookingDto> bookings = const [],
    List<FloorChairDto> chairs = const [],
    this.error,
  }) : bookings = List.unmodifiable(bookings),
       chairs = List.unmodifiable(chairs);

  final bool loading;
  final BranchDashboardDto? dashboard;
  final List<BookingDto> bookings;
  final List<FloorChairDto> chairs;
  final Object? error;

  BranchOperationsState copyWith({
    bool? loading,
    BranchDashboardDto? dashboard,
    List<BookingDto>? bookings,
    List<FloorChairDto>? chairs,
    Object? error,
    bool clearError = false,
  }) => BranchOperationsState(
    loading: loading ?? this.loading,
    dashboard: dashboard ?? this.dashboard,
    bookings: bookings ?? this.bookings,
    chairs: chairs ?? this.chairs,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, dashboard, bookings, chairs, error];
}
