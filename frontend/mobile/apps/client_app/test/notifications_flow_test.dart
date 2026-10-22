import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/core/navigation/app_routes.entity.dart';
import 'package:client_app/src/features/notifications/notifications.bloc.dart';
import 'package:client_app/src/features/notifications/notifications.screen.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeAuthRepository authRepository;
  late FakeNotificationRepository repository;
  late InMemoryTokenStorage storage;

  setUp(() {
    authRepository = FakeAuthRepository();
    repository = FakeNotificationRepository();
    storage = InMemoryTokenStorage('stored-token');
  });

  Future<void> pumpInbox(WidgetTester tester, {bool viaProfile = false}) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    final pair = sessionPair(authRepository, storage);
    final notifications = NotificationsBloc(repository);
    addTearDown(notifications.close);

    final router = buildRouter(
      session: pair.session,
      auth: pair.auth,
      notifications: notifications,
      preferences: InMemoryAppPreferences(dontShowOnboarding: true),
      apiClient: fakeApiClient(),
    );
    addTearDown(pair.coordinator.cancel);
    await tester.pumpWidget(routerHarness(router));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();
    if (viaProfile) {
      router.router.go(AppRoutes.profile);
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
        find.text('Notifications'),
        200,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('Notifications'));
    } else {
      router.router.go(AppRoutes.profileNotifications);
    }
    await tester.pumpAndSettle();
  }

  testWidgets('profile opens the inbox', (tester) async {
    await pumpInbox(tester, viaProfile: true);

    expect(find.byType(NotificationsScreen), findsOneWidget);
    expect(find.text('Booking confirmed'), findsOneWidget);
  });

  testWidgets('tapping an unread notification marks it read', (tester) async {
    await pumpInbox(tester);

    expect(
      find.byKey(const ValueKey('notification-unread-dot')),
      findsOneWidget,
    );
    expect(find.text('Mark all as read'), findsOneWidget);

    await tester.tap(find.text('Booking confirmed'));
    await tester.pumpAndSettle();

    expect(repository.lastMarkedId, 'notification-1');
    expect(find.byKey(const ValueKey('notification-unread-dot')), findsNothing);
    expect(find.text('Mark all as read'), findsNothing);
  });

  testWidgets('mark all as read clears every unread marker', (tester) async {
    repository.firstPage = testNotificationPage(
      notifications: [
        testNotification(),
        testNotification(id: 'notification-2', title: 'Booking started'),
      ],
    );
    await pumpInbox(tester);

    expect(
      find.byKey(const ValueKey('notification-unread-dot')),
      findsNWidgets(2),
    );

    await tester.tap(find.text('Mark all as read'));
    await tester.pumpAndSettle();

    expect(repository.markAllReadCalls, 1);
    expect(find.byKey(const ValueKey('notification-unread-dot')), findsNothing);
  });

  testWidgets('empty inbox shows the empty state', (tester) async {
    repository.firstPage = testNotificationPage(notifications: []);
    await pumpInbox(tester);

    expect(find.text('No notifications yet'), findsOneWidget);
  });

  testWidgets('failed first load offers retry', (tester) async {
    repository.error = offline();
    await pumpInbox(tester);

    expect(find.text('Try again'), findsOneWidget);
    repository.error = null;
    await tester.tap(find.text('Try again'));
    await tester.pumpAndSettle();

    expect(find.text('Booking confirmed'), findsOneWidget);
  });
}
