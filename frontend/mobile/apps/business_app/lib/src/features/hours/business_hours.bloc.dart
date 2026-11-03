import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/hours/business_hours.state.dart';
import 'package:business_app/src/features/hours/business_hours_constants.entity.dart';
import 'package:business_app/src/features/hours/hours_issue.entity.dart';

class BusinessHoursBloc extends Cubit<BusinessHoursState> {
  BusinessHoursBloc(this._repository) : super(BusinessHoursState());

  final BranchHoursRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(loading: true, saved: false, clearError: true));
    try {
      final profile = await _repository.getProfile();
      if (isClosed) return;
      emit(
        state.copyWith(loading: false, days: _fillWeek(profile.openingHours)),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  void setClosed(int dayOfWeek, bool closed) =>
      _replace(dayOfWeek, (day) => _copy(day, isClosed: closed));

  void setOpens(int dayOfWeek, String time) =>
      _replace(dayOfWeek, (day) => _copy(day, opensTime: time));

  void setCloses(int dayOfWeek, String time) =>
      _replace(dayOfWeek, (day) => _copy(day, closesTime: time));

  Future<void> save() async {
    if (state.saving) return;
    final invalid = state.days.any(
      (day) =>
          !day.isClosed &&
          (day.closesTime ?? '').compareTo(day.opensTime ?? '') <= 0,
    );
    if (invalid) {
      emit(state.copyWith(issue: HoursIssue.invalidRange, saved: false));
      return;
    }
    emit(
      state.copyWith(
        saving: true,
        saved: false,
        issue: HoursIssue.none,
        clearError: true,
      ),
    );
    try {
      await _repository.updateOpeningHours(state.days);
      if (isClosed) return;
      emit(state.copyWith(saving: false, saved: true));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(saving: false, error: error));
    }
  }

  void _replace(
    int dayOfWeek,
    BranchOpeningHourDto Function(BranchOpeningHourDto day) change,
  ) => emit(
    state.copyWith(
      saved: false,
      issue: HoursIssue.none,
      days: [
        for (final day in state.days)
          day.dayOfWeek == dayOfWeek ? change(day) : day,
      ],
    ),
  );

  BranchOpeningHourDto _copy(
    BranchOpeningHourDto day, {
    bool? isClosed,
    String? opensTime,
    String? closesTime,
  }) => BranchOpeningHourDto(
    dayOfWeek: day.dayOfWeek,
    isClosed: isClosed ?? day.isClosed,
    opensTime: opensTime ?? day.opensTime,
    closesTime: closesTime ?? day.closesTime,
  );

  List<BranchOpeningHourDto> _fillWeek(List<BranchOpeningHourDto> stored) => [
    for (
      var weekday = 0;
      weekday < BusinessHoursConstants.daysInWeek;
      weekday++
    )
      _normalized(stored, weekday),
  ];

  BranchOpeningHourDto _normalized(
    List<BranchOpeningHourDto> stored,
    int weekday,
  ) {
    final match = stored.where((day) => day.dayOfWeek == weekday);
    if (match.isEmpty) {
      return BranchOpeningHourDto(
        dayOfWeek: weekday,
        isClosed: true,
        opensTime: BusinessHoursConstants.defaultOpens,
        closesTime: BusinessHoursConstants.defaultCloses,
      );
    }
    final day = match.first;
    return BranchOpeningHourDto(
      dayOfWeek: weekday,
      isClosed: day.isClosed,
      opensTime: _trim(day.opensTime, BusinessHoursConstants.defaultOpens),
      closesTime: _trim(day.closesTime, BusinessHoursConstants.defaultCloses),
    );
  }

  String _trim(String? time, String fallback) =>
      time == null || time.length < BusinessHoursConstants.timeLength
      ? fallback
      : time.substring(0, BusinessHoursConstants.timeLength);
}
