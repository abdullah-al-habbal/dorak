import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:business_app/src/features/hours/business_hours.bloc.dart';
import 'package:business_app/src/features/inbox/business_inbox.bloc.dart';
import 'package:business_app/src/features/services/business_services.bloc.dart';
import 'package:business_app/src/features/staff/business_staff.bloc.dart';

import 'helpers/business_fakes.dart';
import 'package:business_app/src/features/hours/hours_issue.entity.dart';

NotificationDto _note(String id, {DateTime? readAt}) => NotificationDto(
  id: id,
  type: 'booking_created',
  title: 'T$id',
  body: 'B',
  readAt: readAt,
);

void main() {
  group('staff', () {
    test(
      'lists the branch staff and toggles activation then reloads',
      () async {
        final repo = FakeBranchStaffRepository(
          staff: const [
            StaffMemberDto(
              id: 'a',
              name: 'Karim',
              status: BarberStatus.enabled,
            ),
            StaffMemberDto(
              id: 'b',
              name: 'Sami',
              status: BarberStatus.disabled,
            ),
          ],
        );
        final activation = FakeActivationRepository();
        final bloc = BusinessStaffBloc(repo, activation);

        await bloc.load();
        expect(bloc.state.staff.map((m) => m.id), ['a', 'b']);

        await bloc.toggle(bloc.state.staff[0]);
        await bloc.toggle(bloc.state.staff[1]);
        expect(activation.deactivated, ['a']);
        expect(activation.activated, ['b']);
        expect(bloc.state.togglingId, isNull);
        await bloc.close();
      },
    );

    test('surfaces a failed toggle and clears the busy marker', () async {
      final activation = FakeActivationRepository()..failure = StateError('x');
      final bloc = BusinessStaffBloc(FakeBranchStaffRepository(), activation);

      await bloc.toggle(
        const StaffMemberDto(id: 'a', name: 'K', status: BarberStatus.enabled),
      );

      expect(bloc.state.error, isNotNull);
      expect(bloc.state.togglingId, isNull);
      await bloc.close();
    });
  });

  group('services', () {
    test('loads the brand services and exposes load failures', () async {
      final services = FakeBranchServiceRepository()
        ..services = const [
          BusinessServiceDto(id: 's1', serviceableId: 'brand-1', name: 'Cut'),
        ];
      final bloc = BusinessServicesBloc(services);

      await bloc.load();
      expect(bloc.state.services.single.id, 's1');

      services.failure = StateError('x');
      await bloc.load();
      expect(bloc.state.error, isNotNull);
      await bloc.close();
    });
  });

  group('hours', () {
    test('fills the whole week and closes days the backend omits', () async {
      final hours = FakeBranchHoursRepository()
        ..hours = const [
          BranchOpeningHourDto(
            dayOfWeek: 1,
            opensTime: '08:00:00',
            closesTime: '16:00:00',
          ),
        ];
      final bloc = BusinessHoursBloc(hours);

      await bloc.load();

      expect(bloc.state.days, hasLength(7));
      expect(bloc.state.days[1].opensTime, '08:00');
      expect(bloc.state.days[1].isClosed, isFalse);
      expect(bloc.state.days[0].isClosed, isTrue);
      await bloc.close();
    });

    test(
      'rejects a closing time before opening and saves a valid week',
      () async {
        final hours = FakeBranchHoursRepository();
        final bloc = BusinessHoursBloc(hours);
        await bloc.load();

        bloc.setClosed(1, false);
        bloc.setCloses(1, '08:00');
        await bloc.save();
        expect(bloc.state.issue, HoursIssue.invalidRange);
        expect(hours.saved, isNull);

        bloc.setCloses(1, '17:00');
        await bloc.save();
        expect(bloc.state.saved, isTrue);
        expect(hours.saved, hasLength(7));
        await bloc.close();
      },
    );
  });

  group('inbox', () {
    test('counts unread, marks one read and then all read', () async {
      final repo = FakeNotificationRepository()
        ..items = [_note('1'), _note('2')];
      final bloc = BusinessInboxBloc(repo);

      await bloc.load();
      expect(bloc.state.unreadCount, 2);

      await bloc.markRead('1');
      expect(repo.read, ['1']);
      expect(bloc.state.unreadCount, 1);

      await bloc.markAllRead();
      expect(repo.allRead, isTrue);
      expect(bloc.state.unreadCount, 0);
      await bloc.close();
    });
  });
}
