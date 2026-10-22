import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/core/navigation/app.router.dart';
import 'package:client_app/src/core/navigation/app_routes.entity.dart';
import 'package:client_app/src/features/booking/booking.bloc.dart';
import 'package:client_app/src/features/booking/bookings.screen.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeAuthRepository authRepository;
  late FakeBookingRepository repository;
  late InMemoryTokenStorage storage;
  late BookingBloc bookings;

  setUp(() {
    authRepository = FakeAuthRepository();
    repository = FakeBookingRepository();
    storage = InMemoryTokenStorage('stored-token');
  });

  Future<AppRouter> pumpBookings(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    final pair = sessionPair(authRepository, storage);
    bookings = BookingBloc(repository);
    addTearDown(bookings.close);

    final router = buildRouter(
      session: pair.session,
      auth: pair.auth,
      bookings: bookings,
      preferences: InMemoryAppPreferences(dontShowOnboarding: true),
      apiClient: fakeApiClient(),
    );
    addTearDown(pair.coordinator.cancel);
    await tester.pumpWidget(routerHarness(router));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();
    router.router.go(AppRoutes.bookings);
    await tester.pumpAndSettle();
    return router;
  }

  testWidgets('bookings tab lists the upcoming page', (tester) async {
    await pumpBookings(tester);

    expect(find.byType(BookingsScreen), findsOneWidget);
    expect(find.textContaining('Karim'), findsOneWidget);
    expect(find.text('Confirmed'), findsOneWidget);
    expect(find.text('Upcoming'), findsOneWidget);
    expect(find.textContaining('Ends'), findsOneWidget);
  });

  testWidgets('late confirmed booking disables cancellation with a warning', (
    tester,
  ) async {
    repository.firstPage = testBookingPage(
      bookings: [testBooking(cancellationEligible: false)],
    );
    await pumpBookings(tester);

    expect(find.text('Cancel Booking'), findsNothing);
    expect(
      find.text(
        'Cancellation is unavailable within two hours of the appointment.',
      ),
      findsOneWidget,
    );
  });

  testWidgets('pending booking shows the Pending label and Cancel action', (
    tester,
  ) async {
    repository.firstPage = testBookingPage(
      bookings: [testBooking(status: 'pending')],
    );
    await pumpBookings(tester);

    expect(find.text('Pending'), findsOneWidget);
    expect(find.text('Cancel Booking'), findsOneWidget);
  });

  testWidgets('past filter reloads with the past status', (tester) async {
    repository.firstPage = testBookingPage(bookings: const []);
    await pumpBookings(tester);

    await tester.tap(find.text('Past'));
    await tester.pumpAndSettle();

    expect(repository.lastStatus, 'past');
    expect(find.text('No bookings yet'), findsOneWidget);
  });

  testWidgets('cancel asks for confirmation then reloads', (tester) async {
    await pumpBookings(tester);

    await tester.tap(find.text('Cancel Booking'));
    await tester.pumpAndSettle();
    expect(find.text('Cancel this booking?'), findsOneWidget);

    await tester.tap(find.text('Yes, Cancel'));
    await tester.pumpAndSettle();

    expect(repository.cancelCalls, 1);
    expect(repository.lastCancelledId, 'booking-1');
    expect(find.text('Cancel this booking?'), findsNothing);
  });

  testWidgets('dismissing the dialog cancels nothing', (tester) async {
    await pumpBookings(tester);

    await tester.tap(find.text('Cancel Booking'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Cancel'));
    await tester.pumpAndSettle();

    expect(repository.cancelCalls, 0);
  });

  testWidgets('failed first load shows retry', (tester) async {
    repository.error = offline();
    await pumpBookings(tester);

    expect(find.text('Try again'), findsOneWidget);

    repository.error = null;
    await tester.tap(find.text('Try again'));
    await tester.pumpAndSettle();

    expect(find.textContaining('Karim'), findsOneWidget);
  });
}
