import 'package:stylist_app/src/features/affiliations/stylist_affiliations.bloc.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.bloc.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.bloc.dart';
import 'package:stylist_app/src/features/profile/stylist_profile.bloc.dart';
import 'package:stylist_app/src/features/reviews/stylist_reviews.bloc.dart';
import 'package:stylist_app/src/features/schedule/stylist_schedule.bloc.dart';

class StylistFeatureBlocs {
  const StylistFeatureBlocs({
    required this.schedule,
    required this.portfolio,
    required this.profile,
    required this.affiliations,
    required this.jobs,
    required this.reviews,
  });

  final StylistScheduleBloc schedule;
  final StylistPortfolioBloc portfolio;
  final StylistProfileBloc profile;
  final StylistAffiliationsBloc affiliations;
  final StylistJobsBloc jobs;
  final StylistReviewsBloc reviews;

  Future<void> close() => Future.wait([
    schedule.close(),
    portfolio.close(),
    profile.close(),
    affiliations.close(),
    jobs.close(),
    reviews.close(),
  ]);
}
