import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/schedule/stylist_schedule.state.dart';

class StylistScheduleBloc extends Cubit<StylistScheduleState> {
  StylistScheduleBloc(this._repository) : super(StylistScheduleState());

  static const daysInWeek = 7;
  static const _defaultStart = '09:00';
  static const _defaultEnd = '17:00';
  static const _timeLength = 5;

  final StylistOperationsRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(loading: true, saved: false, clearError: true));
    try {
      final stored = await _repository.getSchedule();
      if (isClosed) return;
      emit(state.copyWith(loading: false, days: _fillWeek(stored)));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  void setActive(int dayOfWeek, bool active) =>
      _replace(dayOfWeek, (day) => _copy(day, isActive: active));

  void setStart(int dayOfWeek, String time) =>
      _replace(dayOfWeek, (day) => _copy(day, startTime: time));

  void setEnd(int dayOfWeek, String time) =>
      _replace(dayOfWeek, (day) => _copy(day, endTime: time));

  Future<void> save() async {
    if (state.saving) return;
    final active = state.days.where((day) => day.isActive).toList();
    final issue = _validate(active);
    if (issue != ScheduleIssue.none) {
      emit(state.copyWith(issue: issue, saved: false));
      return;
    }
    emit(
      state.copyWith(
        saving: true,
        saved: false,
        issue: ScheduleIssue.none,
        clearError: true,
      ),
    );
    try {
      final stored = await _repository.updateSchedule(active);
      if (isClosed) return;
      emit(
        state.copyWith(saving: false, saved: true, days: _fillWeek(stored)),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(saving: false, error: error));
    }
  }

  ScheduleIssue _validate(List<BarberScheduleDayDto> active) {
    if (active.isEmpty) return ScheduleIssue.noActiveDay;
    final invalid = active.any((day) => day.endTime.compareTo(day.startTime) <= 0);
    return invalid ? ScheduleIssue.invalidRange : ScheduleIssue.none;
  }

  void _replace(
    int dayOfWeek,
    BarberScheduleDayDto Function(BarberScheduleDayDto day) change,
  ) => emit(
    state.copyWith(
      saved: false,
      issue: ScheduleIssue.none,
      days: [
        for (final day in state.days)
          day.dayOfWeek == dayOfWeek ? change(day) : day,
      ],
    ),
  );

  BarberScheduleDayDto _copy(
    BarberScheduleDayDto day, {
    String? startTime,
    String? endTime,
    bool? isActive,
  }) => BarberScheduleDayDto(
    dayOfWeek: day.dayOfWeek,
    startTime: startTime ?? day.startTime,
    endTime: endTime ?? day.endTime,
    isActive: isActive ?? day.isActive,
  );

  List<BarberScheduleDayDto> _fillWeek(List<BarberScheduleDayDto> stored) => [
    for (var weekday = 0; weekday < daysInWeek; weekday++)
      _normalized(stored, weekday),
  ];

  BarberScheduleDayDto _normalized(
    List<BarberScheduleDayDto> stored,
    int weekday,
  ) {
    final match = stored.where((day) => day.dayOfWeek == weekday);
    if (match.isEmpty) {
      return BarberScheduleDayDto(
        dayOfWeek: weekday,
        startTime: _defaultStart,
        endTime: _defaultEnd,
        isActive: false,
      );
    }
    final day = match.first;
    return BarberScheduleDayDto(
      dayOfWeek: weekday,
      startTime: day.startTime.substring(0, _timeLength),
      endTime: day.endTime.substring(0, _timeLength),
      isActive: day.isActive,
    );
  }
}
