import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class BusinessStaffState extends Equatable {
  BusinessStaffState({
    this.loading = false,
    this.togglingId,
    List<StaffMemberDto> staff = const [],
    this.error,
  }) : staff = List.unmodifiable(staff);

  final bool loading;
  final String? togglingId;
  final List<StaffMemberDto> staff;
  final Object? error;

  BusinessStaffState copyWith({
    bool? loading,
    String? togglingId,
    bool clearToggling = false,
    List<StaffMemberDto>? staff,
    Object? error,
    bool clearError = false,
  }) => BusinessStaffState(
    loading: loading ?? this.loading,
    togglingId: clearToggling ? null : togglingId ?? this.togglingId,
    staff: staff ?? this.staff,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, togglingId, staff, error];
}
