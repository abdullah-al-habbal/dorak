import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:core/core.dart';

import 'package:client_app/src/features/review/review_submit.bloc.dart';
import 'package:client_app/src/features/booking/booking.bloc.dart';
import 'package:client_app/src/features/booking/booking.event.dart';
import 'package:client_app/src/features/booking/bookings.screen.dart';
import 'package:client_app/src/core/navigation/app_routes.entity.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeAuthRepository authRepository;
  late FakeBookingRepository repository;
  late FakeReviewRepository reviews;
  late InMemoryTokenStorage storage;

  setUp(() {
    authRepository = FakeAuthRepository();
    repository = FakeBookingRepository();
    reviews = FakeReviewRepository();
    storage = InMemoryTokenStorage('stored-token');
  });

  Future<void> pumpReview(
    WidgetTester tester, {
    BookingStatus status = BookingStatus.completed,
  }) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    final pair = sessionPair(authRepository, storage);
    final reviewBloc = ReviewSubmitBloc(reviews);
    addTearDown(pair.coordinator.cancel);
    addTearDown(reviewBloc.close);

    repository.firstPage = testBookingPage(
      bookings: [testBooking(status: status)],
    );
    final bookingBloc = BookingBloc(repository);
    addTearDown(bookingBloc.close);
    final router = buildRouter(
      session: pair.session,
      auth: pair.auth,
      bookings: bookingBloc,
      reviewSubmit: reviewBloc,
      preferences: InMemoryAppPreferences(dontShowOnboarding: true),
      apiClient: fakeApiClient(),
    );
    await tester.pumpWidget(routerHarness(router));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();
    bookingBloc.add(const BookingsStarted());
    await tester.pumpAndSettle();
    router.router.go(AppRoutes.reviewDetail('booking-1'));
    await tester.pumpAndSettle();
  }

  testWidgets('renders the rating prompt and submit button', (tester) async {
    await pumpReview(tester);

    expect(find.text('Rate Your Experience'), findsOneWidget);
    expect(find.text('How was your session?'), findsOneWidget);
    expect(find.text('Submit Review'), findsOneWidget);
  });

  testWidgets('submitting a rating posts the review and shows success', (
    tester,
  ) async {
    await pumpReview(tester);

    await tester.tap(find.byIcon(Icons.star_border).first);
    await tester.pumpAndSettle();

    await tester.tap(find.text('Submit Review'));
    await tester.pumpAndSettle();

    expect(reviews.submitCalls, 1);
    expect(reviews.lastBookingId, 'booking-1');
    expect(find.text('Review submitted'), findsOneWidget);
  });

  testWidgets('disputed review shows its badge and 48-hour hold note', (
    tester,
  ) async {
    reviews.submittedReview = testReview(
      status: ReviewStatus.disputed,
      disputedAt: DateTime.utc(2026, 9, 29),
    );
    await pumpReview(tester);

    await tester.tap(find.byIcon(Icons.star_border).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Submit Review'));
    await tester.pumpAndSettle();

    expect(find.text('Under review'), findsOneWidget);
    expect(find.textContaining('up to 48 hours'), findsOneWidget);
  });

  testWidgets('review route is independent of the bookings branch state', (
    tester,
  ) async {
    await pumpReview(tester, status: BookingStatus.confirmed);

    expect(find.byType(BookingsScreen), findsNothing);
    expect(find.text('Rate Your Experience'), findsOneWidget);
  });

  testWidgets('submit is disabled until a rating is selected', (tester) async {
    await pumpReview(tester);

    final button = tester.widget<PrimaryButton>(
      find.byType(PrimaryButton).first,
    );
    expect(button.isDisabled, isTrue);
  });

  testWidgets('a submit error surfaces a retry action', (tester) async {
    reviews.submitError = offline();
    await pumpReview(tester);

    await tester.tap(find.byIcon(Icons.star_border).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Submit Review'));
    await tester.pumpAndSettle();

    expect(
      find.text('No connection. Check your network and try again.'),
      findsOneWidget,
    );
    expect(find.text('Try again'), findsOneWidget);

    reviews.submitError = null;
    await tester.tap(find.text('Try again'));
    await tester.pumpAndSettle();

    expect(find.text('Review submitted'), findsOneWidget);
  });

  testWidgets('a 409 submit error maps to already reviewed', (tester) async {
    reviews.submitError = const ApiException(
      statusCode: 409,
      code: 'REVIEW_VALIDATION_FAILED',
      message: 'review::messages.already_reviewed',
    );
    await pumpReview(tester);

    await tester.tap(find.byIcon(Icons.star_border).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Submit Review'));
    await tester.pumpAndSettle();

    expect(find.text('You already reviewed this booking'), findsOneWidget);
  });

  testWidgets('a 403 submit error maps to the generic error', (tester) async {
    reviews.submitError = const ApiException(
      statusCode: 403,
      code: 'REVIEW_VALIDATION_FAILED',
      message: 'review::messages.not_own_booking',
    );
    await pumpReview(tester);

    await tester.tap(find.byIcon(Icons.star_border).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Submit Review'));
    await tester.pumpAndSettle();

    expect(find.text('Could not submit your review'), findsOneWidget);
  });
}
