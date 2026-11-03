import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:core/core.dart';

import 'package:stylist_app/src/core/navigation/app_routes.entity.dart';
import 'package:stylist_app/src/core/stylist_feature_blocs.provider.dart';
import 'package:stylist_app/src/core/navigation/widgets/stylist_shell.widget.dart';
import 'package:stylist_app/src/features/affiliations/stylist_affiliations.screen.dart';
import 'package:stylist_app/src/features/appointments/stylist_appointments.screen.dart';
import 'package:stylist_app/src/features/auth/stylist_forgot_password.screen.dart';
import 'package:stylist_app/src/features/auth/stylist_login.screen.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.screen.dart';
import 'package:stylist_app/src/features/earnings/stylist_earnings.screen.dart';
import 'package:stylist_app/src/features/history/stylist_client_history.screen.dart';
import 'package:stylist_app/src/features/inbox/stylist_inbox.screen.dart';
import 'package:stylist_app/src/features/jobs/stylist_applications.screen.dart';
import 'package:stylist_app/src/features/jobs/stylist_job_detail.screen.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.screen.dart';
import 'package:stylist_app/src/features/more/stylist_more.screen.dart';
import 'package:stylist_app/src/features/operations/stylist.screen.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.screen.dart';
import 'package:stylist_app/src/features/profile/stylist_profile.screen.dart';
import 'package:stylist_app/src/features/reviews/stylist_reviews.screen.dart';
import 'package:stylist_app/src/features/schedule/stylist_schedule.screen.dart';
import 'package:stylist_app/src/features/services/stylist_service_form.screen.dart';
import 'package:stylist_app/src/features/services/stylist_services.screen.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';

class StylistAppRouter {
  StylistAppRouter({
    required StylistBloc operations,
    required StylistFeatureBlocs features,
    required StaffSessionBloc session,
    required StylistSignUpBloc signUp,
    required StaffPasswordResetBloc passwordReset,
    required VoidCallback onLocaleToggle,
    required VoidCallback onLogout,
    required VoidCallback onAuthenticated,
  }) {
    router = GoRouter(
      initialLocation: AppRoutes.login,
      refreshListenable: _sessionRefresh = StaffSessionRefresh(session),
      redirect: (context, state) {
        final atLogin = state.matchedLocation == AppRoutes.login;
        final isPublic =
            atLogin ||
            state.matchedLocation == AppRoutes.signUp ||
            state.matchedLocation == AppRoutes.forgotPassword;
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
            onForgotPassword: () => router.go(AppRoutes.forgotPassword),
          ),
        ),
        GoRoute(
          path: AppRoutes.forgotPassword,
          builder: (context, state) => StylistForgotPasswordScreen(
            bloc: passwordReset,
            onBackToLogin: () => router.go(AppRoutes.login),
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
        StatefulShellRoute.indexedStack(
          builder: (context, state, navigationShell) => StylistShell(
            navigationShell: navigationShell,
            inbox: features.inbox,
          ),
          branches: [
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: AppRoutes.home,
                  builder: (context, state) => StylistScreen(
                    bloc: operations,
                    onLocaleToggle: onLocaleToggle,
                    onLogout: onLogout,
                  ),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: AppRoutes.history,
                  builder: (context, state) =>
                      StylistAppointmentsScreen(bloc: features.appointments),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: AppRoutes.earnings,
                  builder: (context, state) =>
                      StylistEarningsScreen(bloc: features.earnings),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: AppRoutes.inbox,
                  builder: (context, state) => StylistInboxScreen(
                    bloc: features.inbox,
                    onOpen: context.go,
                  ),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: AppRoutes.more,
                  builder: (context, state) => StylistMoreScreen(
                    onNavigate: context.push,
                    onLocaleToggle: onLocaleToggle,
                    onLogout: onLogout,
                  ),
                ),
              ],
            ),
          ],
        ),
        GoRoute(
          path: AppRoutes.schedule,
          builder: (context, state) =>
              StylistScheduleScreen(bloc: features.schedule),
        ),
        GoRoute(
          path: AppRoutes.portfolio,
          builder: (context, state) =>
              StylistPortfolioScreen(bloc: features.portfolio),
        ),
        GoRoute(
          path: AppRoutes.profile,
          builder: (context, state) =>
              StylistProfileScreen(bloc: features.profile),
        ),
        GoRoute(
          path: AppRoutes.affiliations,
          builder: (context, state) =>
              StylistAffiliationsScreen(bloc: features.affiliations),
        ),
        GoRoute(
          path: AppRoutes.reviews,
          builder: (context, state) =>
              StylistReviewsScreen(bloc: features.reviews),
        ),
        GoRoute(
          path: AppRoutes.services,
          builder: (context, state) => StylistServicesScreen(
            bloc: features.services,
            onAdd: () => context.push(AppRoutes.newService),
            onEdit: (id) => context.push(AppRoutes.editService(id)),
          ),
        ),
        GoRoute(
          path: AppRoutes.newService,
          builder: (context, state) =>
              StylistServiceFormScreen(bloc: features.services),
        ),
        GoRoute(
          path: '${AppRoutes.services}/:${AppRoutes.serviceIdParameter}/edit',
          builder: (context, state) => StylistServiceFormScreen(
            bloc: features.services,
            serviceId: state.pathParameters[AppRoutes.serviceIdParameter],
          ),
        ),
        GoRoute(
          path:
              '${AppRoutes.home}/clients/:${AppRoutes.clientIdParameter}/history',
          builder: (context, state) => StylistClientHistoryScreen(
            bloc: features.clientHistory,
            clientId: state.pathParameters[AppRoutes.clientIdParameter]!,
          ),
        ),
        GoRoute(
          path: AppRoutes.jobs,
          builder: (context, state) => StylistJobsScreen(bloc: features.jobs),
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
    );
  }

  late final GoRouter router;
  late final StaffSessionRefresh _sessionRefresh;

  void dispose() {
    router.dispose();
    _sessionRefresh.dispose();
  }
}
