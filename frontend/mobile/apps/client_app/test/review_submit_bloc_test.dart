import 'package:bloc_test/bloc_test.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/review/review_submit.bloc.dart';
import 'package:client_app/src/features/review/review_submit.event.dart';
import 'package:client_app/src/features/review/review_submit.state.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeReviewRepository reviews;

  setUp(() {
    reviews = FakeReviewRepository();
  });

  ReviewSubmitBloc bloc() => ReviewSubmitBloc(reviews);

  group('ReviewSubmitStarted', () {
    blocTest<ReviewSubmitBloc, ReviewSubmitState>(
      'submits rating and comment and marks submitted',
      build: bloc,
      act: (bloc) => bloc.add(
        const ReviewSubmitStarted('booking-1', rating: 4, comment: 'Nice cut'),
      ),
      verify: (bloc) {
        expect(bloc.state.isSubmitting, isFalse);
        expect(bloc.state.submitted, isTrue);
        expect(bloc.state.rating, 4);
        expect(bloc.state.comment, 'Nice cut');
        expect(reviews.submitCalls, 1);
        expect(reviews.lastBookingId, 'booking-1');
        expect(reviews.lastRating, 4);
        expect(reviews.lastComment, 'Nice cut');
      },
    );

    blocTest<ReviewSubmitBloc, ReviewSubmitState>(
      'submits without a comment when one is omitted',
      build: bloc,
      act: (bloc) =>
          bloc.add(const ReviewSubmitStarted('booking-1', rating: 3)),
      verify: (bloc) {
        expect(bloc.state.submitted, isTrue);
        expect(reviews.lastComment, isNull);
      },
    );

    blocTest<ReviewSubmitBloc, ReviewSubmitState>(
      'records the error on failure',
      build: bloc,
      setUp: () => reviews.submitError = offline(),
      act: (bloc) =>
          bloc.add(const ReviewSubmitStarted('booking-1', rating: 5)),
      verify: (bloc) {
        expect(bloc.state.submitted, isFalse);
        expect(bloc.state.error, isA<NetworkException>());
      },
    );

    blocTest<ReviewSubmitBloc, ReviewSubmitState>(
      'a 409 conflict surfaces as an ApiException',
      build: bloc,
      setUp: () => reviews.submitError = const ApiException(
        statusCode: 409,
        code: 'REVIEW_VALIDATION_FAILED',
        message: 'review::messages.already_reviewed',
      ),
      act: (bloc) =>
          bloc.add(const ReviewSubmitStarted('booking-1', rating: 5)),
      verify: (bloc) {
        expect(bloc.state.submitted, isFalse);
        expect(bloc.state.error, isA<ApiException>());
      },
    );
  });

  group('ReviewSubmitRetried', () {
    blocTest<ReviewSubmitBloc, ReviewSubmitState>(
      're-submits using the stored booking and rating',
      build: bloc,
      seed: () => const ReviewSubmitState(
        bookingId: 'booking-1',
        rating: 2,
        comment: 'Mediocre',
      ),
      act: (bloc) => bloc.add(const ReviewSubmitRetried()),
      verify: (bloc) {
        expect(bloc.state.submitted, isTrue);
        expect(reviews.lastBookingId, 'booking-1');
        expect(reviews.lastRating, 2);
        expect(reviews.lastComment, 'Mediocre');
      },
    );

    blocTest<ReviewSubmitBloc, ReviewSubmitState>(
      'is a no-op when the booking is null',
      build: bloc,
      act: (bloc) => bloc.add(const ReviewSubmitRetried()),
      expect: () => [],
    );

    blocTest<ReviewSubmitBloc, ReviewSubmitState>(
      'is a no-op when the rating is null',
      build: bloc,
      seed: () => const ReviewSubmitState(bookingId: 'booking-1'),
      act: (bloc) => bloc.add(const ReviewSubmitRetried()),
      expect: () => [],
    );
  });
}
