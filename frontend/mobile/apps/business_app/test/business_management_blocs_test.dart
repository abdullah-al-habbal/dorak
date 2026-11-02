import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:business_app/src/features/floor_plan/business_floor_plan.bloc.dart';
import 'package:business_app/src/features/floor_plan/floor_plan_preset.entity.dart';
import 'package:business_app/src/features/profile/business_profile.bloc.dart';
import 'package:business_app/src/features/reviews/business_reviews.bloc.dart';

import 'helpers/business_fakes.dart';

void main() {
  test('floor plan saves the selected preset value', () async {
    final repository = FakeBranchManagementRepository();
    final bloc = BusinessFloorPlanBloc(repository);
    addTearDown(bloc.close);

    bloc.select(FloorPlanPreset.unisexZoned);
    await bloc.save();

    expect(repository.savedPreset, 'unisex_zoned');
    expect(bloc.state.saved, isTrue);
  });

  test('profile sends only the filled fields', () async {
    final repository = FakeBranchManagementRepository();
    final bloc = BusinessProfileBloc(repository);
    addTearDown(bloc.close);

    await bloc.save(descriptionEnglish: ' Hello ', tags: 'fade, , beard');

    expect(repository.savedDescription, {'en': 'Hello'});
    expect(repository.savedTags, ['fade', 'beard']);
  });

  test('reviews load from the branch endpoint', () async {
    final bloc = BusinessReviewsBloc(
      FakeBranchManagementRepository(),
      FakeReviewDisputeRepository(),
    );
    addTearDown(bloc.close);

    await bloc.load();

    expect(bloc.state.reviews.single.rating, 4);
  });

  test(
    'disputing a review sends the trimmed reason and marks it disputed',
    () async {
      final disputes = FakeReviewDisputeRepository();
      final bloc = BusinessReviewsBloc(
        FakeBranchManagementRepository(),
        disputes,
      );
      addTearDown(bloc.close);
      await bloc.load();

      final accepted = await bloc.dispute(
        'r1',
        '  Wrong appointment entirely.  ',
      );

      expect(accepted, isTrue);
      expect(disputes.disputedId, 'r1');
      expect(disputes.disputeReason, 'Wrong appointment entirely.');
      expect(bloc.state.reviews.single.disputed, isTrue);
      expect(bloc.state.disputingId, isNull);
    },
  );

  test('a too-short reason never reaches the backend', () async {
    final disputes = FakeReviewDisputeRepository();
    final bloc = BusinessReviewsBloc(
      FakeBranchManagementRepository(),
      disputes,
    );
    addTearDown(bloc.close);
    await bloc.load();

    expect(await bloc.dispute('r1', 'too short'), isFalse);

    expect(disputes.disputedId, isNull);
    expect(bloc.state.reviews.single.published, isTrue);
  });

  test('a rejected dispute keeps the review and surfaces the error', () async {
    final failure = ApiException(
      statusCode: 422,
      code: 'REVIEW_VALIDATION_FAILED',
      message: 'review::messages.dispute_not_allowed',
    );
    final bloc = BusinessReviewsBloc(
      FakeBranchManagementRepository(),
      FakeReviewDisputeRepository(failure: failure),
    );
    addTearDown(bloc.close);
    await bloc.load();

    expect(await bloc.dispute('r1', 'Wrong appointment entirely.'), isFalse);

    expect(bloc.state.error, failure);
    expect(bloc.state.reviews.single.published, isTrue);
    expect(bloc.state.disputingId, isNull);
  });
}
