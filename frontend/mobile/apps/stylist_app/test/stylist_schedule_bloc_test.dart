import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:stylist_app/src/features/schedule/stylist_schedule.bloc.dart';
import 'package:stylist_app/src/features/schedule/stylist_schedule.state.dart';

import 'helpers/stylist_fakes.dart';

void main() {
  late FakeStylistOperationsRepository repository;
  late StylistScheduleBloc bloc;

  setUp(() async {
    repository = FakeStylistOperationsRepository()
      ..schedule = [
        const BarberScheduleDayDto(
          dayOfWeek: 1,
          startTime: '09:00:00',
          endTime: '17:00:00',
        ),
      ];
    bloc = StylistScheduleBloc(repository);
    await bloc.load();
  });

  tearDown(() => bloc.close());

  test('loading fills the whole week and trims seconds', () {
    expect(bloc.state.days, hasLength(7));
    expect(bloc.state.days[1].startTime, '09:00');
    expect(bloc.state.days[1].isActive, isTrue);
    expect(bloc.state.days[0].isActive, isFalse);
  });

  test('saving sends only the active days', () async {
    bloc.setActive(3, true);
    bloc.setEnd(3, '12:30');
    await bloc.save();

    expect(repository.savedSchedule!.map((day) => day.dayOfWeek), [1, 3]);
    expect(repository.savedSchedule!.last.endTime, '12:30');
    expect(bloc.state.saved, isTrue);
  });

  test('an inverted range is rejected before any request', () async {
    bloc.setStart(1, '18:00');
    await bloc.save();

    expect(bloc.state.issue, ScheduleIssue.invalidRange);
    expect(repository.savedSchedule, isNull);
  });

  test('a week with no active day is rejected', () async {
    bloc.setActive(1, false);
    await bloc.save();

    expect(bloc.state.issue, ScheduleIssue.noActiveDay);
    expect(repository.savedSchedule, isNull);
  });
}
