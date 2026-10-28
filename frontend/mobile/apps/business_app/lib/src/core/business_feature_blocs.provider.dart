import 'package:business_app/src/features/affiliations/business_affiliations.bloc.dart';
import 'package:business_app/src/features/floor_plan/business_floor_plan.bloc.dart';
import 'package:business_app/src/features/jobs/business_jobs.bloc.dart';
import 'package:business_app/src/features/profile/business_profile.bloc.dart';
import 'package:business_app/src/features/reviews/business_reviews.bloc.dart';

class BusinessFeatureBlocs {
  const BusinessFeatureBlocs({
    required this.jobs,
    required this.floorPlan,
    required this.affiliations,
    required this.profile,
    required this.reviews,
  });

  final BusinessJobsBloc jobs;
  final BusinessFloorPlanBloc floorPlan;
  final BusinessAffiliationsBloc affiliations;
  final BusinessProfileBloc profile;
  final BusinessReviewsBloc reviews;

  Future<void> close() => Future.wait([
    jobs.close(),
    floorPlan.close(),
    affiliations.close(),
    profile.close(),
    reviews.close(),
  ]);
}
