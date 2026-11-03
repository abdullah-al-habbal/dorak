import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

enum HoursIssue { none, invalidRange }

class BusinessHoursState extends Equatable {
  BusinessHoursState({
    this.loading = false,
    this.saving = false,
    this.saved = false,
    this.issue = HoursIssue.none,
    List<BranchOpeningHourDto> days = const [],
    this.error,
  }) : days = List.unmodifiable(days);

  final bool loading;
  final bool saving;
  final bool saved;
  final HoursIssue issue;
  final List<BranchOpeningHourDto> days;
  final Object? error;

  BusinessHoursState copyWith({
    bool? loading,
    bool? saving,
    bool? saved,
    HoursIssue? issue,
    List<BranchOpeningHourDto>? days,
    Object? error,
    bool clearError = false,
  }) => BusinessHoursState(
    loading: loading ?? this.loading,
    saving: saving ?? this.saving,
    saved: saved ?? this.saved,
    issue: issue ?? this.issue,
    days: days ?? this.days,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, saving, saved, issue, days, error];
}
