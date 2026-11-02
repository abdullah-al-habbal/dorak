import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:core/core.dart';

import 'package:stylist_app/src/core/navigation/app_routes.entity.dart';
import 'package:stylist_app/src/core/stylist_feature_blocs.provider.dart';
import 'package:stylist_app/src/features/affiliations/stylist_affiliations.screen.dart';
import 'package:stylist_app/src/features/auth/stylist_login.screen.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.screen.dart';
import 'package:stylist_app/src/features/jobs/stylist_applications.screen.dart';
import 'package:stylist_app/src/features/jobs/stylist_job_detail.screen.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.screen.dart';
import 'package:stylist_app/src/features/operations/stylist.screen.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.screen.dart';
import 'package:stylist_app/src/features/profile/stylist_profile.screen.dart';
import 'package:stylist_app/src/features/reviews/stylist_reviews.screen.dart';
import 'package:stylist_app/src/features/schedule/stylist_schedule.screen.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';

class StylistAppRouter {
  StylistAppRouter({
    required StylistBloc operations,
    required StylistFeatureBlocs features,
    required StaffSessionBloc session,
    required StylistSignUpBloc signUp,
    required VoidCallback onLocaleToggle,
    required VoidCallback onLogout,
    required VoidCallback onAuthenticated,
  }) {
    router = GoRouter(
      initialLocation: AppRoutes.login,
      redirect: (context, state) {
        final atLogin = state.matchedLocation == AppRoutes.login;
        final isPublic = atLogin || state.matchedLocation == AppRoutes.signUp;
        if (session.state.isAuthenticated && isPublic) return AppRoutes.home;
        if (!session.state.isAuthenticated && !isPublic) return AppRoutes.login;
        return null;
      },
      routes: [
        GoRoute(
          path: AppRoutes.login,
          builder: (context, state) => StylistLoginScreen(
            session: session,
            onAuthenticated: onAuthenticated,
            onLocaleToggle: onLocaleToggle,
            onSignUp: () => router.go(AppRoutes.signUp),
          ),
        ),
        GoRoute(
          path: AppRoutes.signUp,
          builder: (context, state) => StylistSignUpScreen(
            signUp: signUp,
            onBackToLogin: () => router.go(AppRoutes.login),
            onLocaleToggle: onLocaleToggle,
          ),
        ),
        GoRoute(
          path: AppRoutes.home,
          builder: (context, state) => StylistScreen(
            bloc: operations,
            onLocaleToggle: onLocaleToggle,
            onLogout: onLogout,
          ),
          routes: [
            GoRoute(
              path: 'schedule',
              builder: (context, state) =>
                  StylistScheduleScreen(bloc: features.schedule),
            ),
            GoRoute(
              path: 'portfolio',
              builder: (context, state) =>
                  StylistPortfolioScreen(bloc: features.portfolio),
            ),
            GoRoute(
              path: 'profile',
              builder: (context, state) =>
                  StylistProfileScreen(bloc: features.profile),
            ),
            GoRoute(
              path: 'affiliations',
              builder: (context, state) =>
                  StylistAffiliationsScreen(bloc: features.affiliations),
            ),
            GoRoute(
              path: 'reviews',
              builder: (context, state) =>
                  StylistReviewsScreen(bloc: features.reviews),
            ),
            GoRoute(
              path: 'jobs',
              builder: (context, state) =>
                  StylistJobsScreen(bloc: features.jobs),
              routes: [
                GoRoute(
                  path: 'applications',
                  builder: (context, state) =>
                      StylistApplicationsScreen(bloc: features.jobs),
                ),
                GoRoute(
                  path: ':${AppRoutes.jobIdParameter}',
                  builder: (context, state) => StylistJobDetailScreen(
                    bloc: features.jobs,
                    jobId: state.pathParameters[AppRoutes.jobIdParameter]!,
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }

  late final GoRouter router;

  void dispose() => router.dispose();
}
