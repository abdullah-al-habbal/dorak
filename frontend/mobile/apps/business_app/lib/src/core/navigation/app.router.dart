import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
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
import 'package:business_app/src/features/earnings/business_earnings.screen.dart';
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
import 'package:business_app/src/features/services/business_services.screen.dart';
import 'package:business_app/src/features/staff/business_staff.screen.dart';
import 'package:business_app/src/features/support/about_support.screen.dart';
import 'package:business_app/src/features/support/feedback.screen.dart';
import 'package:business_app/src/core/owner_feature_blocs.provider.dart';
import 'package:business_app/src/features/owner/app_role.entity.dart';
import 'package:business_app/src/features/owner/owner_billing.screen.dart';
import 'package:business_app/src/features/owner/owner_branch_form.screen.dart';
import 'package:business_app/src/features/owner/owner_branches.screen.dart';
import 'package:business_app/src/features/owner/owner_home.bloc.dart';
import 'package:business_app/src/features/owner/owner_home.screen.dart';
import 'package:business_app/src/features/owner/owner_home.state.dart';
import 'package:business_app/src/features/owner/owner_service_form.screen.dart';
import 'package:business_app/src/features/owner/owner_services.screen.dart';
import 'package:business_app/src/features/owner/role_auth.repository.dart';

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
    required OwnerFeatureBlocs owner,
    required RoleAuthRepository roles,
    required VoidCallback onRegisterAsOwner,
    LegalLinks? legalLinks,
  }) {
    router = GoRouter(
      initialLocation: AppRoutes.login,
      refreshListenable: _sessionRefresh = StaffSessionRefresh(session),
      redirect: (context, state) {
        final atLogin = state.matchedLocation == AppRoutes.login;
        final isPublic =
            atLogin || state.matchedLocation == AppRoutes.forgotPassword;
        final isOwner = roles.role == AppRole.owner;
        final home = isOwner ? AppRoutes.ownerHome : AppRoutes.operations;
        if (session.state.isAuthenticated && isPublic) return home;
        if (!session.state.isAuthenticated && !isPublic) return AppRoutes.login;
        if (session.state.isAuthenticated) {
          final location = state.matchedLocation;
          final inOwnerArea = location.startsWith(AppRoutes.ownerHome);
          final shared =
              location == AppRoutes.about || location == AppRoutes.feedback;
          if (isOwner && !inOwnerArea && !shared) return home;
          if (!isOwner && inOwnerArea) return home;
        }
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
            role: roles.role,
            onRoleChanged: (role) => roles.role = role,
            onRegisterAsOwner: onRegisterAsOwner,
          ),
        ),
        GoRoute(
          path: AppRoutes.ownerHome,
          builder: (context, state) => OwnerHomeScreen(
            bloc: owner.home,
            onNavigate: context.push,
            onLocaleToggle: onLocaleToggle,
            onLogout: onLogout,
            onRegister: onRegisterAsOwner,
          ),
        ),
        GoRoute(
          path: AppRoutes.ownerBranches,
          builder: (context, state) => _withOwnerHome(
            owner.home,
            (home) => OwnerBranchesScreen(
              isReadOnly: home.isReadOnly,
              bloc: owner.branches,
              onAdd: () => context.push(AppRoutes.ownerNewBranch),
              onEdit: (id) => context.push(
                AppRoutes.ownerEditBranch,
                extra: owner.branches.state.branches.firstWhere(
                  (branch) => branch.id == id,
                ),
              ),
            ),
          ),
        ),
        GoRoute(
          path: AppRoutes.ownerNewBranch,
          builder: (context, state) => _withOwnerHome(
            owner.home,
            (home) => OwnerBranchFormScreen(
              isReadOnly: home.isReadOnly,
              bloc: owner.branches,
              brandId: home.brand?.id ?? '',
              onDone: () => _leave(context, AppRoutes.ownerBranches),
            ),
          ),
        ),
        GoRoute(
          path: AppRoutes.ownerEditBranch,
          builder: (context, state) => _withOwnerHome(
            owner.home,
            (home) => OwnerBranchFormScreen(
              isReadOnly: home.isReadOnly,
              bloc: owner.branches,
              brandId: home.brand?.id ?? '',
              branch: state.extra as OwnerBranchDto?,
              onDone: () => _leave(context, AppRoutes.ownerBranches),
            ),
          ),
        ),
        GoRoute(
          path: AppRoutes.ownerBilling,
          builder: (context, state) => OwnerBillingScreen(bloc: owner.billing),
        ),
        GoRoute(
          path: AppRoutes.ownerServices,
          builder: (context, state) => _withOwnerHome(
            owner.home,
            (home) => OwnerServicesScreen(
              isReadOnly: home.isReadOnly,
              bloc: owner.services,
              onAdd: () => context.push(AppRoutes.ownerNewService),
              onEdit: (service) =>
                  context.push(AppRoutes.ownerEditService, extra: service),
            ),
          ),
        ),
        GoRoute(
          path: AppRoutes.ownerNewService,
          builder: (context, state) => _withOwnerHome(
            owner.home,
            (home) => OwnerServiceFormScreen(
              isReadOnly: home.isReadOnly,
              bloc: owner.services,
              brandId: home.brand?.id ?? '',
              onDone: () => _leave(context, AppRoutes.ownerServices),
            ),
          ),
        ),
        GoRoute(
          path: AppRoutes.ownerEditService,
          builder: (context, state) => _withOwnerHome(
            owner.home,
            (home) => OwnerServiceFormScreen(
              isReadOnly: home.isReadOnly,
              bloc: owner.services,
              brandId: home.brand?.id ?? '',
              service: state.extra as BusinessServiceDto?,
              onDone: () => _leave(context, AppRoutes.ownerServices),
            ),
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
                  builder: (context, state) =>
                      BusinessServicesScreen(bloc: features.services),
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
          path: AppRoutes.hours,
          builder: (context, state) =>
              BusinessHoursScreen(bloc: features.hours),
        ),
        GoRoute(
          path: AppRoutes.earnings,
          builder: (context, state) =>
              BusinessEarningsScreen(bloc: features.earnings),
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
        GoRoute(
          path: AppRoutes.about,
          builder: (context, state) => AboutSupportScreen(
            legalLinks:
                legalLinks ??
                LegalLinks.fromApiBaseUrl(ConfigProvider.config.apiBaseUrl),
            onFeedback: () => context.push(AppRoutes.feedback),
          ),
        ),
        GoRoute(
          path: AppRoutes.feedback,
          builder: (context, state) =>
              FeedbackScreen(bloc: features.feedback, screenKey: 'more/about'),
        ),
      ],
    );
  }

  /// Rebuilds an open owner screen when the brand changes, so a suspension
  /// turns it read-only at once.
  static Widget _withOwnerHome(
    OwnerHomeCubit home,
    Widget Function(OwnerHomeState state) builder,
  ) => BlocBuilder<OwnerHomeCubit, OwnerHomeState>(
    bloc: home,
    builder: (context, state) => builder(state),
  );

  /// Closes a form: back when it was pushed, otherwise to its list (deep link).
  static void _leave(BuildContext context, String fallback) =>
      context.canPop() ? context.pop() : context.go(fallback);

  late final GoRouter router;
  late final StaffSessionRefresh _sessionRefresh;

  void dispose() {
    router.dispose();
    _sessionRefresh.dispose();
  }
}
