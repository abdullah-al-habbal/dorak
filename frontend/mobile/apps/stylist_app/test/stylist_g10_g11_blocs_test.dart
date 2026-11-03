import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:stylist_app/src/features/appointments/stylist_appointments.bloc.dart';
import 'package:stylist_app/src/features/earnings/stylist_earnings.bloc.dart';
import 'package:stylist_app/src/features/inbox/stylist_inbox.bloc.dart';
import 'package:stylist_app/src/features/services/stylist_service_draft.entity.dart';
import 'package:stylist_app/src/features/services/stylist_services.bloc.dart';

import 'helpers/stylist_fakes.dart';
import 'package:stylist_app/src/features/earnings/earnings_range.entity.dart';

const _draft = StylistServiceDraft(
  nameEn: 'Cut',
  nameAr: 'قص',
  price: 9.5,
  currencyCode: 'USD',
  durationMinutes: 25,
);

void main() {
  group('past appointments', () {
    test('loads history and filters by status from page one', () async {
      final repo = FakeStylistAppointmentRepository()
        ..history = [
          bookingFixture('a', status: BookingStatus.completed),
          bookingFixture('b', status: BookingStatus.cancelled),
        ];
      final bloc = StylistAppointmentsBloc(repo);

      await bloc.load();
      expect(bloc.state.page.items, hasLength(2));

      await bloc.filter(BookingStatus.cancelled);
      expect(bloc.state.page.items.single.id, 'b');
      expect(repo.requestedStatuses.last, BookingStatus.cancelled);

      await bloc.filter(null);
      expect(bloc.state.page.items, hasLength(2));
      await bloc.close();
    });

    test('a failed first load is reported on the page', () async {
      final bloc = StylistAppointmentsBloc(
        FakeStylistAppointmentRepository()..failure = StateError('x'),
      );

      await bloc.load();

      expect(bloc.state.page.hasFailedFirst, isTrue);
      await bloc.close();
    });
  });

  group('earnings', () {
    test('requests the current month, then all time', () async {
      final repo = FakeEarningsRepository()
        ..earnings = const EarningsDto(
          scope: 'barber',
          totals: [EarningsTotalDto(currencyCode: 'USD', grossMinor: 5000)],
        );
      final bloc = StylistEarningsBloc(
        repo,
        clock: () => DateTime(2026, 11, 15),
      );

      await bloc.load();
      expect(repo.fromRequests.last, DateTime(2026, 11));
      expect(bloc.state.earnings!.totals.single.grossMinor, 5000);

      await bloc.selectRange(EarningsRange.all);
      expect(repo.fromRequests.last, isNull);
      await bloc.close();
    });

    test('keeps the error when the request fails', () async {
      final bloc = StylistEarningsBloc(
        FakeEarningsRepository()..failure = StateError('x'),
      );

      await bloc.load();

      expect(bloc.state.error, isNotNull);
      expect(bloc.state.loading, isFalse);
      await bloc.close();
    });
  });

  group('services editor', () {
    test('creates, updates and deletes through the repository', () async {
      final repo = FakeStylistOperationsRepository();
      final bloc = StylistServicesBloc(repo);

      expect(await bloc.save(_draft), isTrue);
      expect(repo.createdServiceName, {'en': 'Cut', 'ar': 'قص'});
      expect(bloc.state.services.single.priceAmountMinor, 950);

      final id = bloc.state.services.single.id;
      expect(await bloc.save(_draft, id: id), isTrue);
      expect(repo.updatedServiceId, id);
      expect(await bloc.delete(id), isTrue);
      expect(bloc.state.services, isEmpty);
      await bloc.close();
    });

    test('a rejected save reports the error and unlocks the form', () async {
      final repo = FakeStylistOperationsRepository()
        ..serviceFailure = StateError('x');
      final bloc = StylistServicesBloc(repo);

      expect(await bloc.save(_draft), isFalse);
      expect(bloc.state.saving, isFalse);
      expect(bloc.state.error, isNotNull);
      await bloc.close();
    });
  });

  test('inbox counts unread and marks them read', () async {
    final repo = FakeNotificationRepository()
      ..items = [
        const NotificationDto(id: '1', type: 'x', title: 'a', body: 'b'),
        const NotificationDto(id: '2', type: 'x', title: 'a', body: 'b'),
      ];
    final bloc = StylistInboxBloc(repo);

    await bloc.load();
    expect(bloc.state.unreadCount, 2);
    await bloc.markRead('1');
    expect(bloc.state.unreadCount, 1);
    await bloc.markAllRead();
    expect(bloc.state.unreadCount, 0);
    await bloc.close();
  });
}
