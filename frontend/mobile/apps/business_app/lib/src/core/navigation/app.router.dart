import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:core/core.dart';

import 'package:business_app/src/features/auth/business_login.screen.dart';
import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/barbers/manual_barber.screen.dart';
import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.screen.dart';

class BusinessAppRouter {
  BusinessAppRouter({
    required BranchOperationsBloc operations,
    required ManualBarberBloc barbers,
    required StaffSessionBloc session,
    required VoidCallback onLocaleToggle,
    required VoidCallback onLogout,
    required VoidCallback onAuthenticated,
  }) {
    router = GoRouter(
      initialLocation: '/login',
      redirect: (context, state) {
        final atLogin = state.matchedLocation == '/login';
        if (session.state.isAuthenticated && atLogin) return '/operations';
        if (!session.state.isAuthenticated && !atLogin) return '/login';
        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => BusinessLoginScreen(
            session: session,
            onAuthenticated: onAuthenticated,
            onLocaleToggle: onLocaleToggle,
          ),
        ),
        GoRoute(
          path: '/operations',
          builder: (context, state) => BranchOperationsScreen(
            bloc: operations,
            onLocaleToggle: onLocaleToggle,
            onLogout: onLogout,
            onAddBarber: () => context.push('/barbers/new'),
          ),
        ),
        GoRoute(
          path: '/barbers/new',
          builder: (context, state) => ManualBarberScreen(bloc: barbers),
        ),
      ],
    );
  }

  late final GoRouter router;

  void dispose() => router.dispose();
}
