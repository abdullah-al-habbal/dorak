import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:core/core.dart';

import 'package:business_app/src/core/business_feature_blocs.provider.dart';
import 'package:business_app/src/core/navigation/app_routes.entity.dart';
import 'package:business_app/src/features/affiliations/business_affiliations.screen.dart';
import 'package:business_app/src/features/auth/business_login.screen.dart';
import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/barbers/manual_barber.screen.dart';
import 'package:business_app/src/core/navigation/widgets/business_shell.widget.dart';
import 'package:business_app/src/features/floor_plan/business_floor_plan.screen.dart';
import 'package:business_app/src/features/hours/business_hours.screen.dart';
import 'package:business_app/src/features/inbox/business_inbox.screen.dart';
import 'package:business_app/src/features/more/business_more.screen.dart';
import 'package:business_app/src/features/jobs/business_applicants.screen.dart';
import 'package:business_app/src/features/jobs/business_job_form.screen.dart';
import 'package:business_app/src/features/auth/business_forgot_password.screen.dart';
import 'package:business_app/src/features/jobs/business_jobs.screen.dart';
import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.screen.dart';
import 'package:business_app/src/features/profile/business_profile.screen.dart';
import 'package:business_app/src/features/reviews/business_reviews.screen.dart';
import 'package:business_app/src/features/services/business_service_form.screen.dart';
import 'package:business_app/src/features/services/business_services.screen.dart';
import 'package:business_app/src/features/staff/business_staff.screen.dart';

class BusinessAppRouter {
  BusinessAppRouter({
    required BranchOperationsBloc operations,
    required ManualBarberBloc barbers,
    required BusinessFeatureBlocs features,
    required StaffSessionBloc session,
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
            atLogin || state.matchedLocation == AppRoutes.forgotPassword;
        if (session.state.isAuthenticated && isPublic) {
          return AppRoutes.operations;
        }
        if (!session.state.isAuthenticated && !isPublic) return AppRoutes.login;
        return null;
      },
      routes: [
        GoRoute(
          path: AppRoutes.login,
          builder: (context, state) => BusinessLoginScreen(
            session: session,
            onAuthenticated: onAuthenticated,
            onLocaleToggle: onLocaleToggle,
            onForgotPassword: () => router.go(AppRoutes.forgotPassword),
          ),
        ),
        GoRoute(
          path: AppRoutes.forgotPassword,
          builder: (context, state) => BusinessForgotPasswordScreen(
            bloc: passwordReset,
            onBackToLogin: () => router.go(AppRoutes.login),
          ),
        ),
        StatefulShellRoute.indexedStack(
          builder: (context, state, navigationShell) => BusinessShell(
            navigationShell: navigationShell,
            inbox: features.inbox,
          ),
          branches: [
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: AppRoutes.operations,
                  builder: (context, state) => BranchOperationsScreen(
                    bloc: operations,
                    onLocaleToggle: onLocaleToggle,
                    onLogout: onLogout,
                    onAddBarber: () => context.push(AppRoutes.newBarber),
                  ),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: AppRoutes.staff,
                  builder: (context, state) =>
                      BusinessStaffScreen(bloc: features.staff),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: AppRoutes.services,
                  builder: (context, state) => BusinessServicesScreen(
                    bloc: features.services,
                    onAdd: () => context.push(AppRoutes.newService),
                    onEdit: (id) => context.push(AppRoutes.editService(id)),
                  ),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: AppRoutes.inbox,
                  builder: (context, state) => BusinessInboxScreen(
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
                  builder: (context, state) => BusinessMoreScreen(
                    onNavigate: context.push,
                    onAddBarber: () => context.push(AppRoutes.newBarber),
                    onLocaleToggle: onLocaleToggle,
                    onLogout: onLogout,
                  ),
                ),
              ],
            ),
          ],
        ),
        GoRoute(
          path: AppRoutes.newService,
          builder: (context, state) =>
              BusinessServiceFormScreen(bloc: features.services),
        ),
        GoRoute(
          path: '${AppRoutes.services}/:${AppRoutes.serviceIdParameter}/edit',
          builder: (context, state) => BusinessServiceFormScreen(
            bloc: features.services,
            serviceId: state.pathParameters[AppRoutes.serviceIdParameter],
          ),
        ),
        GoRoute(
          path: AppRoutes.hours,
          builder: (context, state) =>
              BusinessHoursScreen(bloc: features.hours),
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
  late final StaffSessionRefresh _sessionRefresh;

  void dispose() {
    router.dispose();
    _sessionRefresh.dispose();
  }
}
