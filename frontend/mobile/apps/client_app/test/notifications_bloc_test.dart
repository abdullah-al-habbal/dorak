import 'package:bloc_test/bloc_test.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/notifications/notifications.bloc.dart';
import 'package:client_app/src/features/notifications/notifications.event.dart';
import 'package:client_app/src/features/notifications/notifications.state.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeNotificationRepository repository;

  setUp(() => repository = FakeNotificationRepository());

  NotificationsBloc bloc() => NotificationsBloc(repository);

  NotificationsState loaded([PaginatedData<NotificationDto>? page]) =>
      NotificationsState(
        page: Paged<NotificationDto>.initial().succeeded(
          page ?? repository.firstPage,
        ),
      );

  group('NotificationsStarted', () {
    blocTest<NotificationsBloc, NotificationsState>(
      'loads the first page',
      build: bloc,
      act: (bloc) => bloc.add(const NotificationsStarted()),
      verify: (bloc) {
        expect(bloc.state.page.items, hasLength(1));
        expect(bloc.state.hasUnread, isTrue);
        expect(repository.lastPage, 1);
      },
    );

    blocTest<NotificationsBloc, NotificationsState>(
      'second start is a no-op once items are loaded',
      build: bloc,
      seed: loaded,
      act: (bloc) => bloc.add(const NotificationsStarted()),
      expect: () => [],
    );

    blocTest<NotificationsBloc, NotificationsState>(
      'a failed first load fails the page and retry recovers',
      build: bloc,
      setUp: () => repository.error = offline(),
      act: (bloc) async {
        bloc.add(const NotificationsStarted());
        await Future<void>.delayed(Duration.zero);
        repository.error = null;
        bloc.add(const NotificationsRetryRequested());
      },
      verify: (bloc) {
        expect(bloc.state.page.hasFailed, isFalse);
        expect(bloc.state.page.items, hasLength(1));
        expect(repository.getNotificationsCalls, 2);
      },
    );
  });

  group('NotificationsLoadMoreRequested', () {
    blocTest<NotificationsBloc, NotificationsState>(
      'appends the next page',
      build: bloc,
      setUp: () => repository.morePage = testNotificationPage(
        notifications: [testNotification(id: 'notification-2')],
        currentPage: 2,
        totalPages: 2,
      ),
      seed: () => loaded(testNotificationPage(totalPages: 2)),
      act: (bloc) => bloc.add(const NotificationsLoadMoreRequested()),
      verify: (bloc) {
        expect(repository.lastPage, 2);
        expect(bloc.state.page.items.map((item) => item.id), [
          'notification-1',
          'notification-2',
        ]);
      },
    );
  });

  group('NotificationMarkReadRequested', () {
    blocTest<NotificationsBloc, NotificationsState>(
      'marks the notification read, clears markingId and reloads',
      build: bloc,
      seed: loaded,
      act: (bloc) =>
          bloc.add(const NotificationMarkReadRequested('notification-1')),
      verify: (bloc) {
        expect(repository.lastMarkedId, 'notification-1');
        expect(bloc.state.markingId, isNull);
        expect(bloc.state.hasUnread, isFalse);
        expect(bloc.state.page.items.single.isUnread, isFalse);
      },
    );

    blocTest<NotificationsBloc, NotificationsState>(
      'ignores a notification that is already read',
      build: bloc,
      seed: () => loaded(
        testNotificationPage(
          notifications: [testNotification(readAt: DateTime.utc(2026))],
        ),
      ),
      act: (bloc) =>
          bloc.add(const NotificationMarkReadRequested('notification-1')),
      expect: () => [],
      verify: (_) => expect(repository.markReadCalls, 0),
    );

    blocTest<NotificationsBloc, NotificationsState>(
      'keeps items and stores the error when marking fails',
      build: bloc,
      setUp: () => repository.markError = offline(),
      seed: loaded,
      act: (bloc) =>
          bloc.add(const NotificationMarkReadRequested('notification-1')),
      verify: (bloc) {
        expect(bloc.state.markingId, isNull);
        expect(bloc.state.error, isA<NetworkException>());
        expect(bloc.state.page.items.single.isUnread, isTrue);
      },
    );

    blocTest<NotificationsBloc, NotificationsState>(
      'a later successful action clears the stored error',
      build: bloc,
      seed: () => loaded().copyWith(error: offline()),
      act: (bloc) =>
          bloc.add(const NotificationMarkReadRequested('notification-1')),
      verify: (bloc) => expect(bloc.state.error, isNull),
    );
  });

  group('NotificationsMarkAllReadRequested', () {
    blocTest<NotificationsBloc, NotificationsState>(
      'marks everything read and reloads',
      build: bloc,
      setUp: () => repository.firstPage = testNotificationPage(
        notifications: [
          testNotification(),
          testNotification(id: 'notification-2'),
        ],
      ),
      seed: loaded,
      act: (bloc) => bloc.add(const NotificationsMarkAllReadRequested()),
      verify: (bloc) {
        expect(repository.markAllReadCalls, 1);
        expect(bloc.state.isMarkingAll, isFalse);
        expect(bloc.state.hasUnread, isFalse);
      },
    );

    blocTest<NotificationsBloc, NotificationsState>(
      'does nothing when nothing is unread',
      build: bloc,
      seed: () => loaded(
        testNotificationPage(
          notifications: [testNotification(readAt: DateTime.utc(2026))],
        ),
      ),
      act: (bloc) => bloc.add(const NotificationsMarkAllReadRequested()),
      expect: () => [],
    );
  });

  test('copyWith clearMarking drops the marking id', () {
    const state = NotificationsState(markingId: 'notification-1');
    expect(state.copyWith(clearMarking: true).markingId, isNull);
    expect(state.copyWith().markingId, 'notification-1');
  });
}
