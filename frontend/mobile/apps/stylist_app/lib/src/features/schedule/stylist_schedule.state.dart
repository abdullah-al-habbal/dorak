import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

enum ScheduleIssue { none, noActiveDay, invalidRange }

class StylistScheduleState extends Equatable {
  StylistScheduleState({
    this.loading = false,
    this.saving = false,
    this.saved = false,
    this.issue = ScheduleIssue.none,
    List<BarberScheduleDayDto> days = const [],
    this.error,
  }) : days = List.unmodifiable(days);

  final bool loading;
  final bool saving;
  final bool saved;
  final ScheduleIssue issue;
  final List<BarberScheduleDayDto> days;
  final Object? error;

  StylistScheduleState copyWith({
    bool? loading,
    bool? saving,
    bool? saved,
    ScheduleIssue? issue,
    List<BarberScheduleDayDto>? days,
    Object? error,
    bool clearError = false,
  }) => StylistScheduleState(
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
