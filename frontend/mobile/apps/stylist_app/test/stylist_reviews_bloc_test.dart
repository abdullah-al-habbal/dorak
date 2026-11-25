import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:stylist_app/src/features/reviews/stylist_reviews.bloc.dart';

import 'helpers/stylist_fakes.dart';

void main() {
  late FakeReviewRepository reviews;
  late FakeReviewDisputeRepository disputes;
  late StylistReviewsBloc bloc;

  StylistReviewsBloc build({String? barberId = 'barber-1'}) {
    final created = StylistReviewsBloc(reviews, disputes, () => barberId);
    addTearDown(created.close);
    return created;
  }

  setUp(() {
    reviews = FakeReviewRepository();
    disputes = FakeReviewDisputeRepository();
    bloc = build();
  });

  test('loads the signed-in stylist\'s published reviews', () async {
    await bloc.load();

    expect(reviews.requestedBarberId, 'barber-1');
    expect(bloc.state.reviews.single.published, isTrue);
  });

  test('does not load before the stylist profile is known', () async {
    await build(barberId: null).load();

    expect(reviews.requestedBarberId, isNull);
  });

  test('disputing sends the trimmed reason and marks the review', () async {
    await bloc.load();

    final accepted = await bloc.dispute('r1', '  Client never showed up.  ');

    expect(accepted, isTrue);
    expect(disputes.disputedId, 'r1');
    expect(disputes.disputeReason, 'Client never showed up.');
    expect(bloc.state.reviews.single.disputed, isTrue);
    expect(bloc.state.disputingId, isNull);
  });

  test('a too-short or too-long reason never reaches the backend', () async {
    await bloc.load();

    expect(await bloc.dispute('r1', 'too short'), isFalse);
    expect(await bloc.dispute('r1', 'x' * 1001), isFalse);

    expect(disputes.disputedId, isNull);
    expect(bloc.state.reviews.single.published, isTrue);
  });

  test('a rejected dispute keeps the review and surfaces the error', () async {
    const failure = ApiException(
      statusCode: 422,
      code: 'REVIEW_VALIDATION_FAILED',
      message: 'review::messages.dispute_not_allowed',
    );
    disputes = FakeReviewDisputeRepository(failure: failure);
    bloc = build();
    await bloc.load();

    expect(await bloc.dispute('r1', 'Client never showed up.'), isFalse);

    expect(bloc.state.error, failure);
    expect(bloc.state.reviews.single.published, isTrue);
    expect(bloc.state.disputingId, isNull);
  });
}
