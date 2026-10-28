import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:core/core.dart';

import 'package:business_app/src/core/business_feature_blocs.provider.dart';
import 'package:business_app/src/core/navigation/app_routes.entity.dart';
import 'package:business_app/src/features/affiliations/business_affiliations.screen.dart';
import 'package:business_app/src/features/auth/business_login.screen.dart';
import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/barbers/manual_barber.screen.dart';
import 'package:business_app/src/features/floor_plan/business_floor_plan.screen.dart';
import 'package:business_app/src/features/jobs/business_applicants.screen.dart';
import 'package:business_app/src/features/jobs/business_job_form.screen.dart';
import 'package:business_app/src/features/jobs/business_jobs.screen.dart';
import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.screen.dart';
import 'package:business_app/src/features/profile/business_profile.screen.dart';
import 'package:business_app/src/features/reviews/business_reviews.screen.dart';

class BusinessAppRouter {
  BusinessAppRouter({
    required BranchOperationsBloc operations,
    required ManualBarberBloc barbers,
    required BusinessFeatureBlocs features,
    required StaffSessionBloc session,
    required VoidCallback onLocaleToggle,
    required VoidCallback onLogout,
    required VoidCallback onAuthenticated,
  }) {
    router = GoRouter(
      initialLocation: AppRoutes.login,
      redirect: (context, state) {
        final atLogin = state.matchedLocation == AppRoutes.login;
        if (session.state.isAuthenticated && atLogin) return AppRoutes.operations;
        if (!session.state.isAuthenticated && !atLogin) return AppRoutes.login;
        return null;
      },
      routes: [
        GoRoute(
          path: AppRoutes.login,
          builder: (context, state) => BusinessLoginScreen(
            session: session,
            onAuthenticated: onAuthenticated,
            onLocaleToggle: onLocaleToggle,
          ),
        ),
        GoRoute(
          path: AppRoutes.operations,
          builder: (context, state) => BranchOperationsScreen(
            bloc: operations,
            onLocaleToggle: onLocaleToggle,
            onLogout: onLogout,
            onAddBarber: () => context.push(AppRoutes.newBarber),
            onNavigate: context.push,
          ),
        ),
        GoRoute(
          path: AppRoutes.newBarber,
          builder: (context, state) => ManualBarberScreen(bloc: barbers),
        ),
        GoRoute(
          path: AppRoutes.jobs,
          builder: (context, state) => BusinessJobsScreen(bloc: features.jobs),
        ),
        GoRoute(
          path: AppRoutes.newJob,
          builder: (context, state) =>
              BusinessJobFormScreen(bloc: features.jobs),
        ),
        GoRoute(
          path: '${AppRoutes.jobs}/:${AppRoutes.jobIdParameter}/edit',
          builder: (context, state) => BusinessJobFormScreen(
            bloc: features.jobs,
            jobId: state.pathParameters[AppRoutes.jobIdParameter],
          ),
        ),
        GoRoute(
          path: '${AppRoutes.jobs}/:${AppRoutes.jobIdParameter}/applicants',
          builder: (context, state) => BusinessApplicantsScreen(
            bloc: features.jobs,
            jobId: state.pathParameters[AppRoutes.jobIdParameter]!,
          ),
        ),
        GoRoute(
          path: AppRoutes.floorPlan,
          builder: (context, state) =>
              BusinessFloorPlanScreen(bloc: features.floorPlan),
        ),
        GoRoute(
          path: AppRoutes.affiliations,
          builder: (context, state) =>
              BusinessAffiliationsScreen(bloc: features.affiliations),
        ),
        GoRoute(
          path: AppRoutes.profile,
          builder: (context, state) =>
              BusinessProfileScreen(bloc: features.profile),
        ),
        GoRoute(
          path: AppRoutes.reviews,
          builder: (context, state) =>
              BusinessReviewsScreen(bloc: features.reviews),
        ),
      ],
    );
  }

  late final GoRouter router;

  void dispose() => router.dispose();
}
