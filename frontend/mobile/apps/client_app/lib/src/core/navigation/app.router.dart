import 'dart:async';

import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import 'package:client_app/src/core/locale/locale.bloc.dart';
import 'package:client_app/src/core/navigation/app_gate.entity.dart';
import 'package:client_app/src/core/navigation/app_routes.entity.dart';
import 'package:client_app/src/core/navigation/app_services.provider.dart';
import 'package:client_app/src/core/navigation/widgets/main_shell.widget.dart';
import 'package:client_app/src/features/auth/auth_entry.screen.dart';
import 'package:client_app/src/features/auth/change_password.bloc.dart';
import 'package:client_app/src/features/auth/change_password.screen.dart';
import 'package:client_app/src/features/auth/create_new_password.screen.dart';
import 'package:client_app/src/features/auth/forgot_password.screen.dart';
import 'package:client_app/src/features/auth/login.screen.dart';
import 'package:client_app/src/features/auth/password_recovery.bloc.dart';
import 'package:client_app/src/features/auth/password_recovery.event.dart';
import 'package:client_app/src/features/auth/password_recovery.state.dart';
import 'package:client_app/src/features/auth/password_reset_success.screen.dart';
import 'package:client_app/src/features/auth/recovery_otp.screen.dart';
import 'package:client_app/src/features/auth/recovery_signal.entity.dart';
import 'package:client_app/src/features/auth/sign_up.screen.dart';
import 'package:client_app/src/features/auth/verify_account.screen.dart';
import 'package:client_app/src/features/booking/booking.bloc.dart';
import 'package:client_app/src/features/booking/bookings.screen.dart';
import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.screen.dart';
import 'package:client_app/src/features/booking/booking_details.screen.dart';
import 'package:client_app/src/features/booking/booking_tracker.screen.dart';
import 'package:client_app/src/features/discovery/discovery.bloc.dart';
import 'package:client_app/src/features/discovery/discovery.screen.dart'
    as discovery_feed;
import 'package:client_app/src/features/onboarding/ai_showcase.screen.dart';
import 'package:client_app/src/features/onboarding/booking.screen.dart';
import 'package:client_app/src/features/onboarding/discovery.screen.dart';
import 'package:client_app/src/features/onboarding/onboarding_config.bloc.dart';
import 'package:client_app/src/features/onboarding/onboarding_config.event.dart';
import 'package:client_app/src/features/onboarding/welcome.screen.dart';
import 'package:client_app/src/features/profile/avatar.bloc.dart';
import 'package:client_app/src/features/profile/face_analysis.bloc.dart';
import 'package:client_app/src/features/profile/favorites.screen.dart';
import 'package:client_app/src/features/profile/favorites.bloc.dart';
import 'package:client_app/src/features/profile/history.bloc.dart';
import 'package:client_app/src/features/profile/photo_picker.provider.dart';
import 'package:client_app/src/features/profile/profile_completion.bloc.dart';
import 'package:client_app/src/features/profile/profile_completion.screen.dart';
import 'package:client_app/src/features/profile/profile.screen.dart';
import 'package:client_app/src/features/profile/profile_edit.screen.dart';
import 'package:client_app/src/features/profile/saved_addresses.screen.dart';
import 'package:client_app/src/features/splash/splash.screen.dart';
import 'package:client_app/src/features/stylist/stylist_profile.bloc.dart';
import 'package:client_app/src/features/stylist/stylist_profile.screen.dart';
import 'package:client_app/src/features/review/review_submit.bloc.dart';
import 'package:client_app/src/features/review/review_submit.screen.dart';

class AppRouter {
  final SessionBloc session;
  final AuthBloc auth;
  final AppPreferences preferences;
  final AuthRepository authRepository;
  final LocaleBloc locale;
  final FeedCache? feedCache;
  final AppServices services;
  final PasswordRecoveryBloc? recovery;
  final OnboardingConfigBloc? onboardingConfig;
  final BookingBloc? bookings;
  final BranchDetailBloc? branchDetail;
  final ChangePasswordBloc? passwordChange;
  final DiscoveryBloc? discovery;
  final HistoryBloc? history;
  final FavoritesBloc? favorites;
  final FaceAnalysisBloc? faceAnalysis;
  final AvatarBloc? avatar;
  final StylistProfileBloc? stylistProfile;
  final ReviewSubmitBloc? reviewSubmit;
  final ProfileCompletionBloc? profileCompletion;
  final PhotoPicker photoPicker;
  final VoidCallback switchLocale;
  final ApiClient apiClient;
  final RealtimeClient? realtime;

  late final GoRouter router;
  late final StreamSubscription<SessionState> _sessionSubscription;
  late final StreamSubscription<AuthState> _authSubscription;

  AppRouter({
    required this.session,
    required this.auth,
    required this.preferences,
    required this.authRepository,
    required this.locale,
    this.feedCache,
    AppServices? services,
    this.recovery,
    this.onboardingConfig,
    this.bookings,
    this.branchDetail,
    this.passwordChange,
    this.discovery,
    this.history,
    this.favorites,
    this.faceAnalysis,
    this.avatar,
    this.stylistProfile,
    this.reviewSubmit,
    this.profileCompletion,
    required this.photoPicker,
    required this.switchLocale,
    required this.apiClient,
    this.realtime,
  }) : services =
           services ??
           AppServices.live(
             apiClient: apiClient,
             preferences: preferences,
             authRepository: authRepository,
             feedCache: feedCache,
           ) {
    router = GoRouter(
      initialLocation: AppRoutes.splash,
      redirect: _redirect,
      routes: _routes(),
    );
    _sessionSubscription = session.stream.listen(_onSessionChanged);
    _authSubscription = auth.stream.listen(_onAuthChanged);
  }

  void dispose() {
    _sessionSubscription.cancel();
    _authSubscription.cancel();
    router.dispose();
  }

  void _onSessionChanged(SessionState state) {
    router.refresh();
    switch (state.signal) {
      case SessionSignal.sessionExpired:
        router.go(AppRoutes.authEntry);
        session.add(SignalAcknowledged());
        apiClient.resetUnauthorizedSignal();
      case SessionSignal.accountBanned:
        router.go(AppRoutes.authEntry);
        session.add(SignalAcknowledged());
        apiClient.resetUnauthorizedSignal();
      case SessionSignal.authenticationRequired:
        router.push<void>(AppRoutes.authEntry);
        session.add(SignalAcknowledged());
        apiClient.resetUnauthorizedSignal();
      case SessionSignal.none:
        break;
    }
  }

  void _onAuthChanged(AuthState state) {
    switch (state.signal) {
      case AuthSignal.loginSucceeded:
        final client = state.client;
        if (client != null && !client.emailVerified) {
          router.push<void>(AppRoutes.authVerify, extra: client.email);
        } else {
          router.go(_postAuthRoute());
        }
        auth.add(AuthSignalAcknowledged());
      case AuthSignal.registrationSucceeded:
        router.push<void>(
          AppRoutes.authVerify,
          extra: state.client?.email ?? '',
        );
        auth.add(AuthSignalAcknowledged());
      case AuthSignal.verificationSucceeded:
        router.go(_postAuthRoute());
        auth.add(AuthSignalAcknowledged());
      case AuthSignal.none:
        break;
    }
  }

  String? _redirect(Object context, GoRouterState state) {
    if (session.state.status == AuthStatus.unknown) {
      return state.matchedLocation == AppRoutes.splash
          ? null
          : AppRoutes.splash;
    }
    return null;
  }

  String _postAuthRoute() => preferences.profileCompleted
      ? AppRoutes.discover
      : AppRoutes.profileCompletion;

  Future<void> _leaveSplash() async {
    await session.ready;
    router.go(
      AppGate.resolve(
        isAuthenticated: session.state.isAuthenticated,
        dontShowOnboarding: preferences.dontShowOnboarding,
        profileCompleted: preferences.profileCompleted,
      ),
    );
  }

  void _skipForNow() => router.go(AppRoutes.discover);

  void _onBookNow() {
    if (!session.state.isAuthenticated) {
      session.add(RequireAuthentication());
    }
  }

  Future<void> _dismissForever() async {
    try {
      await preferences.setDontShowOnboarding(true);
    } finally {
      router.go(AppRoutes.discover);
    }
  }

  Widget _scope<T extends BlocBase<dynamic>>(
    T? existing,
    T Function() create,
    Widget Function(T bloc) child,
  ) {
    if (existing != null) {
      return BlocProvider<T>.value(value: existing, child: child(existing));
    }
    return BlocProvider<T>(
      create: (_) => create(),
      child: Builder(builder: (context) => child(context.read<T>())),
    );
  }

  OnboardingConfigBloc _newOnboardingConfig() =>
      services.createOnboardingConfig()..add(
        OnboardingConfigLoadRequested(localeCode: locale.state.languageCode),
      );

  Widget _recoveryScreen(Widget Function(PasswordRecoveryBloc bloc) child) =>
      BlocListener<PasswordRecoveryBloc, PasswordRecoveryState>(
        listenWhen: (previous, current) => previous.signal != current.signal,
        listener: (context, state) {
          switch (state.signal) {
            case RecoverySignal.codeSent:
              context.push<void>(AppRoutes.authRecoveryOtp);
            case RecoverySignal.codeAccepted:
              context.push<void>(AppRoutes.authResetPassword);
            case RecoverySignal.passwordReset:
              context.push<void>(AppRoutes.authResetPasswordSuccess);
            case RecoverySignal.none:
              break;
          }
          if (state.signal != RecoverySignal.none) {
            context.read<PasswordRecoveryBloc>().add(
              RecoverySignalAcknowledged(),
            );
          }
        },
        child: Builder(
          builder: (context) => child(context.read<PasswordRecoveryBloc>()),
        ),
      );

  List<RouteBase> _routes() {
    return [
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) =>
            SplashScreen(onFinished: () => unawaited(_leaveSplash())),
      ),
      GoRoute(
        path: AppRoutes.profileCompletion,
        builder: (context, state) => _scope(
          profileCompletion,
          services.createProfileCompletion,
          (bloc) => ProfileCompletionScreen(
            bloc: bloc,
            initialName: session.state.client?.name ?? '',
            initialPhone: session.state.client?.phone,
            onCompleted: () => router.go(AppRoutes.discover),
          ),
        ),
      ),
      GoRoute(
        path: AppRoutes.onboardingWelcome,
        builder: (context, state) => _scope(
          onboardingConfig,
          _newOnboardingConfig,
          (bloc) => WelcomeScreen(
            onboardingConfig: bloc,
            onNext: () => router.push<void>(AppRoutes.onboardingDiscovery),
            onSkipForNow: _skipForNow,
            onDontShowAgain: () => unawaited(_dismissForever()),
            onLocaleToggle: switchLocale,
          ),
        ),
      ),
      GoRoute(
        path: AppRoutes.onboardingDiscovery,
        builder: (context, state) => _scope(
          onboardingConfig,
          _newOnboardingConfig,
          (bloc) => DiscoveryScreen(
            onboardingConfig: bloc,
            onNext: () => router.push<void>(AppRoutes.onboardingBooking),
            onSkipForNow: _skipForNow,
            onDontShowAgain: () => unawaited(_dismissForever()),
            onLocaleToggle: switchLocale,
          ),
        ),
      ),
      GoRoute(
        path: AppRoutes.onboardingBooking,
        builder: (context, state) => BookingScreen(
          onNext: () => router.push<void>(AppRoutes.onboardingAiStyle),
          onSkipForNow: _skipForNow,
          onDontShowAgain: () => unawaited(_dismissForever()),
          onLocaleToggle: switchLocale,
        ),
      ),
      GoRoute(
        path: AppRoutes.onboardingAiStyle,
        builder: (context, state) => AiShowcaseScreen(
          onNext: () => unawaited(_dismissForever()),
          onSkipForNow: _skipForNow,
          onDontShowAgain: () => unawaited(_dismissForever()),
          onLocaleToggle: switchLocale,
        ),
      ),
      GoRoute(
        path: AppRoutes.authEntry,
        builder: (context, state) => AuthEntryScreen(
          onLogin: () => router.push<void>(AppRoutes.authLogin),
          onSignup: () => router.push<void>(AppRoutes.authRegister),
          onGuest: () => router.go(AppRoutes.onboardingWelcome),
          onLocaleToggle: switchLocale,
        ),
        routes: [
          GoRoute(
            path: AppRoutes.loginSegment,
            builder: (context, state) => LoginScreen(
              auth: auth,
              session: session,
              onCreateAccount: () => router.push<void>(AppRoutes.authRegister),
              onForgotPassword: () =>
                  router.push<void>(AppRoutes.authForgotPassword),
              onLocaleToggle: switchLocale,
            ),
          ),
          GoRoute(
            path: AppRoutes.registerSegment,
            builder: (context, state) => SignUpScreen(
              auth: auth,
              onLogInLink: () => router.push<void>(AppRoutes.authLogin),
              onLocaleToggle: switchLocale,
            ),
          ),
          GoRoute(
            path: AppRoutes.verifySegment,
            builder: (context, state) => VerifyAccountScreen(
              auth: auth,
              destination: state.extra as String? ?? '',
              onSkip: () => router.go(AppRoutes.discover),
              onLocaleToggle: switchLocale,
            ),
          ),
          ShellRoute(
            builder: (context, state, child) =>
                _scope(recovery, services.createPasswordRecovery, (_) => child),
            routes: [
              GoRoute(
                path: AppRoutes.forgotPasswordSegment,
                builder: (context, state) => _recoveryScreen(
                  (recovery) => ForgotPasswordScreen(
                    recovery: recovery,
                    onReturnToLogIn: () => router.go(AppRoutes.authLogin),
                    onLocaleToggle: switchLocale,
                  ),
                ),
                routes: [
                  GoRoute(
                    path: AppRoutes.recoveryOtpSegment,
                    builder: (context, state) => _recoveryScreen(
                      (recovery) => RecoveryOtpScreen(
                        recovery: recovery,
                        onLocaleToggle: switchLocale,
                      ),
                    ),
                  ),
                ],
              ),
              GoRoute(
                path: AppRoutes.resetPasswordSegment,
                builder: (context, state) => _recoveryScreen(
                  (recovery) => CreateNewPasswordScreen(
                    recovery: recovery,
                    onReenterCode: () => router.go(AppRoutes.authRecoveryOtp),
                    onLocaleToggle: switchLocale,
                  ),
                ),
                routes: [
                  GoRoute(
                    path: AppRoutes.resetPasswordSuccessSegment,
                    builder: (context, state) => _recoveryScreen(
                      (_) => PasswordResetSuccessScreen(
                        onLogIn: () => router.go(AppRoutes.authLogin),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      // Legacy home route redirects to the shell (Discover tab)
      GoRoute(
        path: AppRoutes.home,
        redirect: (context, state) => AppRoutes.discover,
      ),
      // Main authenticated shell with bottom navigation
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShell(navigationShell: navigationShell);
        },
        branches: [
          // Tab 0: Discover
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.discover,
                builder: (context, state) => _scope(
                  discovery,
                  services.createDiscovery,
                  (bloc) => discovery_feed.DiscoveryScreen(
                    bloc: bloc,
                    onLocaleToggle: switchLocale,
                    onBookNow: _onBookNow,
                    onViewDetails: (branchId) =>
                        router.push<void>(AppRoutes.branchDetail(branchId)),
                  ),
                ),
                routes: [
                  GoRoute(
                    path: AppRoutes.branchDetailSegment,
                    builder: (context, state) => _scope(
                      favorites,
                      services.createFavorites,
                      (favoritesBloc) => _scope(
                        branchDetail,
                        services.createBranchDetail,
                        (bloc) => BranchDetailScreen(
                          bloc: bloc,
                          branchId: state.pathParameters['branchId'] ?? '',
                          onLocaleToggle: switchLocale,
                          onViewBookings: () => router.go(AppRoutes.bookings),
                          onBarberSelected: (barberId) => router.push<void>(
                            AppRoutes.barberDetail(barberId),
                          ),
                          onFavorite: (id, type) => unawaited(
                            favoritesBloc.add(
                              favorableId: id,
                              favorableType: type,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  GoRoute(
                    path: AppRoutes.discoverBarberSegment,
                    builder: (context, state) => _scope(
                      stylistProfile,
                      services.createStylistProfile,
                      (bloc) => StylistProfileScreen(
                        bloc: bloc,
                        barberId: state.pathParameters['barberId'] ?? '',
                        onLocaleToggle: switchLocale,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          // Tab 1: Bookings
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.bookings,
                builder: (context, state) => _scope(
                  bookings,
                  services.createBookings,
                  (bloc) => BookingsScreen(
                    bloc: bloc,
                    onLocaleToggle: switchLocale,
                    onRate: (bookingId) =>
                        router.push<void>(AppRoutes.reviewDetail(bookingId)),
                    onTrack: (booking) => router.push<void>(
                      AppRoutes.bookingTracker,
                      extra: booking,
                    ),
                    onDetails: (booking) => router.push<void>(
                      AppRoutes.bookingDetails(booking.id),
                      extra: booking,
                    ),
                  ),
                ),
                routes: [
                  GoRoute(
                    path: AppRoutes.reviewSegment,
                    builder: (context, state) => _scope(
                      reviewSubmit,
                      services.createReviewSubmit,
                      (bloc) => ReviewSubmitScreen(
                        bloc: bloc,
                        bookingId: state.pathParameters['bookingId'] ?? '',
                        onLocaleToggle: switchLocale,
                        onSubmitted: () => router.go(AppRoutes.bookings),
                        onBack: () => router.pop(),
                        onViewBookings: () => router.go(AppRoutes.bookings),
                      ),
                    ),
                  ),
                  GoRoute(
                    path: AppRoutes.bookingTrackerSegment,
                    builder: (context, state) => BookingTrackerScreen(
                      booking: state.extra! as BookingDto,
                      repository: services.createBookingRepository(),
                      realtime: realtime,
                      clientId: session.state.client?.id,
                    ),
                  ),
                  GoRoute(
                    path: AppRoutes.bookingDetailsSegment,
                    builder: (context, state) => BookingDetailsScreen(
                      booking: state.extra! as BookingDto,
                      repository: services.createBookingRepository(),
                    ),
                  ),
                ],
              ),
            ],
          ),
          // Tab 2: Favorites
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.favorites,
                builder: (context, state) => _scope(
                  favorites,
                  services.createFavorites,
                  (bloc) => FavoritesScreen(bloc: bloc),
                ),
              ),
            ],
          ),
          // Tab 3: Profile
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.profile,
                builder: (context, state) => MultiBlocProvider(
                  providers: [
                    if (history == null)
                      BlocProvider(create: (_) => services.createHistory())
                    else
                      BlocProvider.value(value: history!),
                    if (faceAnalysis == null)
                      BlocProvider(create: (_) => services.createFaceAnalysis())
                    else
                      BlocProvider.value(value: faceAnalysis!),
                    if (avatar == null)
                      BlocProvider(create: (_) => services.createAvatar())
                    else
                      BlocProvider.value(value: avatar!),
                  ],
                  child: Builder(
                    builder: (context) => ProfileScreen(
                      history: context.read<HistoryBloc>(),
                      faceAnalysis: context.read<FaceAnalysisBloc>(),
                      avatar: context.read<AvatarBloc>(),
                      photoPicker: photoPicker,
                      clientName: session.state.client?.name,
                      onChangePassword: () =>
                          router.push<void>(AppRoutes.profilePassword),
                      onViewBookings: () => router.go(AppRoutes.bookings),
                      onEditProfile: () =>
                          router.push<void>(AppRoutes.profileEdit),
                      onSavedAddresses: () =>
                          router.push<void>(AppRoutes.profileAddresses),
                    ),
                  ),
                ),
                routes: [
                  GoRoute(
                    path: AppRoutes.profilePasswordSegment,
                    builder: (context, state) => _scope(
                      passwordChange,
                      services.createChangePassword,
                      (bloc) => ChangePasswordScreen(
                        passwordChange: bloc,
                        onLocaleToggle: switchLocale,
                      ),
                    ),
                  ),
                  GoRoute(
                    path: AppRoutes.profileEditSegment,
                    builder: (context, state) => ProfileEditScreen(
                      repository: services.createProfileRepository(),
                      name: session.state.client?.name ?? '',
                      phone: session.state.client?.phone,
                    ),
                  ),
                  GoRoute(
                    path: AppRoutes.profileAddressesSegment,
                    builder: (context, state) =>
                        SavedAddressesScreen(preferences: preferences),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ];
  }
}
