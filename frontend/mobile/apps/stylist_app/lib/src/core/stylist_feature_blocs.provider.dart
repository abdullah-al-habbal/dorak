import 'package:core/core.dart';

import 'package:stylist_app/src/features/affiliations/stylist_affiliations.bloc.dart';
import 'package:stylist_app/src/features/appointments/stylist_appointments.bloc.dart';
import 'package:stylist_app/src/features/earnings/stylist_earnings.bloc.dart';
import 'package:stylist_app/src/features/history/stylist_client_history.bloc.dart';
import 'package:stylist_app/src/features/inbox/stylist_inbox.bloc.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.bloc.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.bloc.dart';
import 'package:stylist_app/src/features/profile/stylist_profile.bloc.dart';
import 'package:stylist_app/src/features/reviews/stylist_reviews.bloc.dart';
import 'package:stylist_app/src/features/schedule/stylist_schedule.bloc.dart';
import 'package:stylist_app/src/features/services/stylist_services.bloc.dart';
import 'package:stylist_app/src/features/support/delete_account.bloc.dart';

class StylistFeatureBlocs {
  const StylistFeatureBlocs({
    required this.schedule,
    required this.portfolio,
    required this.profile,
    required this.affiliations,
    required this.jobs,
    required this.reviews,
    required this.clientHistory,
    required this.appointments,
    required this.earnings,
    required this.services,
    required this.inbox,
    required this.feedback,
    required this.deleteAccount,
  });

  final StylistScheduleBloc schedule;
  final StylistPortfolioBloc portfolio;
  final StylistProfileBloc profile;
  final StylistAffiliationsBloc affiliations;
  final StylistJobsBloc jobs;
  final StylistReviewsBloc reviews;
  final StylistClientHistoryBloc clientHistory;
  final StylistAppointmentsBloc appointments;
  final StylistEarningsBloc earnings;
  final StylistServicesBloc services;
  final StylistInboxBloc inbox;
  final FeedbackBloc feedback;
  final DeleteAccountBloc deleteAccount;

  Future<void> close() => Future.wait([
    schedule.close(),
    portfolio.close(),
    profile.close(),
    affiliations.close(),
    jobs.close(),
    reviews.close(),
    clientHistory.close(),
    appointments.close(),
    earnings.close(),
    services.close(),
    inbox.close(),
    feedback.close(),
    deleteAccount.close(),
  ]);
}
