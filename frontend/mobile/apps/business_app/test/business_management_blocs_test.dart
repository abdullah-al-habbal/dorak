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
    final bloc = BusinessReviewsBloc(FakeBranchManagementRepository());
    addTearDown(bloc.close);

    await bloc.load();

    expect(bloc.state.reviews.single.rating, 4);
  });
}
