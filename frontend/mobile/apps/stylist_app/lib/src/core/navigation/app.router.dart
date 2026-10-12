import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:core/core.dart';

import 'package:stylist_app/src/features/auth/stylist_login.screen.dart';
import 'package:stylist_app/src/features/operations/stylist.screen.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';

class StylistAppRouter {
  StylistAppRouter({
    required StylistBloc operations,
    required StaffSessionBloc session,
    required VoidCallback onLocaleToggle,
    required VoidCallback onLogout,
    required VoidCallback onAuthenticated,
  }) {
    router = GoRouter(
      initialLocation: '/login',
      redirect: (context, state) {
        final atLogin = state.matchedLocation == '/login';
        if (session.state.isAuthenticated && atLogin) return '/home';
        if (!session.state.isAuthenticated && !atLogin) return '/login';
        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => StylistLoginScreen(
            session: session,
            onAuthenticated: onAuthenticated,
            onLocaleToggle: onLocaleToggle,
          ),
        ),
        GoRoute(
          path: '/home',
          builder: (context, state) => StylistScreen(
            bloc: operations,
            onLocaleToggle: onLocaleToggle,
            onLogout: onLogout,
          ),
        ),
      ],
    );
  }

  late final GoRouter router;

  void dispose() => router.dispose();
}
