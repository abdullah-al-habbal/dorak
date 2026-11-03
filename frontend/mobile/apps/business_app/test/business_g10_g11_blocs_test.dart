import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:business_app/src/features/hours/business_hours.bloc.dart';
import 'package:business_app/src/features/hours/business_hours.state.dart';
import 'package:business_app/src/features/inbox/business_inbox.bloc.dart';
import 'package:business_app/src/features/services/business_service_draft.entity.dart';
import 'package:business_app/src/features/services/business_services.bloc.dart';
import 'package:business_app/src/features/staff/business_staff.bloc.dart';

import 'helpers/business_fakes.dart';

const _draft = BusinessServiceDraft(
  nameEn: 'Cut',
  nameAr: 'قص',
  price: 12.5,
  currencyCode: 'USD',
  durationMinutes: 30,
);

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
    test('creates with the profile brand and reloads the list', () async {
      final services = FakeBranchServiceRepository();
      final bloc = BusinessServicesBloc(services, FakeBranchHoursRepository());

      expect(await bloc.save(_draft), isTrue);

      expect(services.createdBrandId, 'brand-1');
      expect(services.createdName, {'en': 'Cut', 'ar': 'قص'});
      expect(bloc.state.services.single.priceAmountMinor, 1250);
      await bloc.close();
    });

    test('updates and deletes by id', () async {
      final services = FakeBranchServiceRepository()
        ..services = const [
          BusinessServiceDto(id: 's1', serviceableId: 'brand-1', name: 'Cut'),
        ];
      final bloc = BusinessServicesBloc(services, FakeBranchHoursRepository());

      expect(await bloc.save(_draft, id: 's1'), isTrue);
      expect(services.updatedId, 's1');
      expect(await bloc.delete('s1'), isTrue);
      expect(services.deletedId, 's1');
      expect(bloc.state.services, isEmpty);
      await bloc.close();
    });

    test(
      'a rejected save keeps the form usable and reports the error',
      () async {
        final services = FakeBranchServiceRepository()
          ..failure = StateError('x');
        final bloc = BusinessServicesBloc(
          services,
          FakeBranchHoursRepository(),
        );

        expect(await bloc.save(_draft), isFalse);
        expect(bloc.state.saving, isFalse);
        expect(bloc.state.error, isNotNull);
        await bloc.close();
      },
    );
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
