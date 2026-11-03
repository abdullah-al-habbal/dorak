import 'package:business_app/src/features/affiliations/business_affiliations.bloc.dart';
import 'package:business_app/src/features/floor_plan/business_floor_plan.bloc.dart';
import 'package:business_app/src/features/hours/business_hours.bloc.dart';
import 'package:business_app/src/features/inbox/business_inbox.bloc.dart';
import 'package:business_app/src/features/jobs/business_jobs.bloc.dart';
import 'package:business_app/src/features/profile/business_profile.bloc.dart';
import 'package:business_app/src/features/reviews/business_reviews.bloc.dart';
import 'package:business_app/src/features/services/business_services.bloc.dart';
import 'package:business_app/src/features/staff/business_staff.bloc.dart';

class BusinessFeatureBlocs {
  const BusinessFeatureBlocs({
    required this.jobs,
    required this.floorPlan,
    required this.affiliations,
    required this.profile,
    required this.reviews,
    required this.staff,
    required this.services,
    required this.hours,
    required this.inbox,
  });

  final BusinessJobsBloc jobs;
  final BusinessFloorPlanBloc floorPlan;
  final BusinessAffiliationsBloc affiliations;
  final BusinessProfileBloc profile;
  final BusinessReviewsBloc reviews;
  final BusinessStaffBloc staff;
  final BusinessServicesBloc services;
  final BusinessHoursBloc hours;
  final BusinessInboxBloc inbox;

  Future<void> close() => Future.wait([
    jobs.close(),
    floorPlan.close(),
    affiliations.close(),
    profile.close(),
    reviews.close(),
    staff.close(),
    services.close(),
    hours.close(),
    inbox.close(),
  ]);
}
