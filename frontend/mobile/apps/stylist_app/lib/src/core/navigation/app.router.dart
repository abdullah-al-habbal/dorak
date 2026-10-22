import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:core/core.dart';

import 'package:stylist_app/src/features/auth/stylist_login.screen.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.screen.dart';
import 'package:stylist_app/src/features/operations/stylist.screen.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';

class StylistAppRouter {
  StylistAppRouter({
    required StylistBloc operations,
    required StaffSessionBloc session,
    required StylistSignUpBloc signUp,
    required VoidCallback onLocaleToggle,
    required VoidCallback onLogout,
    required VoidCallback onAuthenticated,
  }) {
    router = GoRouter(
      initialLocation: '/login',
      redirect: (context, state) {
        final atLogin = state.matchedLocation == '/login';
        final isPublic = atLogin || state.matchedLocation == '/signup';
        if (session.state.isAuthenticated && isPublic) return '/home';
        if (!session.state.isAuthenticated && !isPublic) return '/login';
        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => StylistLoginScreen(
            session: session,
            onAuthenticated: onAuthenticated,
            onLocaleToggle: onLocaleToggle,
            onSignUp: () => router.go('/signup'),
          ),
        ),
        GoRoute(
          path: '/signup',
          builder: (context, state) => StylistSignUpScreen(
            signUp: signUp,
            onBackToLogin: () => router.go('/login'),
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
