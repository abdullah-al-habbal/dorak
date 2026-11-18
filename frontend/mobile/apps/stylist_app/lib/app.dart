import 'dart:async';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/navigation/app.router.dart';
import 'package:stylist_app/src/core/navigation/app_routes.entity.dart';
import 'package:stylist_app/src/core/stylist_feature_blocs.provider.dart';
import 'package:stylist_app/src/features/affiliations/stylist_affiliations.bloc.dart';
import 'package:stylist_app/src/core/navigation/notification_location.entity.dart';
import 'package:stylist_app/src/features/appointments/stylist_appointments.bloc.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/earnings/stylist_earnings.bloc.dart';
import 'package:stylist_app/src/features/history/stylist_client_history.bloc.dart';
import 'package:stylist_app/src/features/inbox/stylist_inbox.bloc.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.bloc.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';
import 'package:stylist_app/src/features/portfolio/image_picker_photo_picker.provider.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.bloc.dart';
import 'package:stylist_app/src/features/profile/stylist_profile.bloc.dart';
import 'package:stylist_app/src/features/reviews/stylist_reviews.bloc.dart';
import 'package:stylist_app/src/features/schedule/stylist_schedule.bloc.dart';
import 'package:stylist_app/src/features/services/stylist_services.bloc.dart';
import 'package:stylist_app/src/features/support/delete_account.bloc.dart';
import 'package:stylist_app/src/core/locale/app_locales.entity.dart';

class StylistApp extends StatefulWidget {
  const StylistApp({super.key});

  @override
  State<StylistApp> createState() => _StylistAppState();
}

class _StylistAppState extends State<StylistApp> {
  Locale _locale = AppLocales.english;
  late final ApiClient _client;
  late final StylistBloc _bloc;
  late final StylistFeatureBlocs _features;
  late final RealtimeClient? _realtime;
  late final PushNotificationService _pushNotifications;
  late final StylistAppRouter _router;
  late final StaffSessionBloc _session;
  late final StylistSignUpBloc _signUp;
  late final StaffPasswordResetBloc _passwordReset;
  late final TokenStorage _tokenStorage;
  late final StreamSubscription<void> _unauthorizedSubscription;
  late final StreamSubscription<NotificationTarget>
  _notificationOpenSubscription;

  @override
  void initState() {
    super.initState();
    _tokenStorage = SecureBarberTokenStorage();
    _client = ApiClient(
      baseUrl: ConfigProvider.config.apiBaseV1Url,
      tokenProvider: _readToken,
      localeResolver: () => _locale.languageCode,
    );
    _realtime = _createRealtime(_tokenStorage);
    _pushNotifications = PushNotificationService(_client);
    _notificationOpenSubscription = _pushNotifications.opened.listen(
      _openNotification,
    );
    final staffAuth = DioStaffAuthRepository(_client, StaffAuthRoutes.barber());
    _session = StaffSessionBloc(staffAuth, _tokenStorage);
    _passwordReset = StaffPasswordResetBloc(staffAuth);
    _signUp = StylistSignUpBloc(DioBarberRegistrationRepository(_client));
    _unauthorizedSubscription = _client.unauthorizedStream.listen(
      (_) => _onUnauthorized(),
    );
    final operations = DioStylistOperationsRepository(_client);
    _bloc = StylistBloc(operations, realtime: _realtime);
    _features = StylistFeatureBlocs(
      schedule: StylistScheduleBloc(operations),
      portfolio: StylistPortfolioBloc(
        operations,
        const ImagePickerPhotoPicker(),
      ),
      profile: StylistProfileBloc(operations),
      affiliations: StylistAffiliationsBloc(
        DioAffiliationRepository(_client),
        () => _bloc.state.profile?.id,
      ),
      jobs: StylistJobsBloc(DioJobPostingRepository(_client)),
      reviews: StylistReviewsBloc(
        DioReviewRepository(_client),
        DioBarberReviewDisputeRepository(_client),
        () => _bloc.state.profile?.id,
      ),
      clientHistory: StylistClientHistoryBloc(
        DioBarberHistoryRepository(_client),
        const ImagePickerPhotoPicker(),
        () => _bloc.state.profile?.id,
      ),
      appointments: StylistAppointmentsBloc(
        DioStylistAppointmentRepository(_client),
      ),
      earnings: StylistEarningsBloc(DioEarningsRepository.barber(_client)),
      services: StylistServicesBloc(operations),
      inbox: StylistInboxBloc(DioNotificationRepository(_client)),
      feedback: FeedbackBloc(
        DioFeedbackRepository(_client),
        FeedbackApp.stylist,
      ),
      deleteAccount: DeleteAccountBloc(staffAuth),
    );
    _router = StylistAppRouter(
      operations: _bloc,
      features: _features,
      session: _session,
      signUp: _signUp,
      passwordReset: _passwordReset,
      onLocaleToggle: _toggleLocale,
      onLogout: _logout,
      onAuthenticated: _onAuthenticated,
      onAccountDeleted: _onUnauthorized,
    );
    unawaited(_restoreSession());
  }

  @override
  void dispose() {
    _router.dispose();
    _session.close();
    _signUp.close();
    _passwordReset.close();
    _unauthorizedSubscription.cancel();
    _notificationOpenSubscription.cancel();
    _bloc.close();
    unawaited(_features.close());
    _realtime?.dispose();
    unawaited(_pushNotifications.dispose());
    _client.dispose();
    super.dispose();
  }

  Future<String?> _readToken() async =>
      _signUp.state.onboardingToken ?? await _tokenStorage.read();

  RealtimeClient? _createRealtime(TokenStorage tokenStorage) {
    final configuration = ConfigProvider.realtimeConfiguration;
    if (configuration.appKey.isEmpty || configuration.host.isEmpty) return null;
    return RealtimeClient(
      configuration: configuration,
      tokenProvider: tokenStorage.read,
    );
  }

  @override
  Widget build(BuildContext context) => MaterialApp.router(
    locale: _locale,
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
    theme: DorakTheme.forLocale(_locale, Brightness.light),
    routerConfig: _router.router,
    builder: (context, child) => MultiBlocProvider(
      providers: [
        BlocProvider.value(value: _bloc),
        BlocProvider.value(value: _session),
      ],
      child: child!,
    ),
  );

  void _toggleLocale() => setState(
    () => _locale = _locale.languageCode == AppLocales.englishCode
        ? AppLocales.arabic
        : AppLocales.english,
  );

  Future<void> _restoreSession() async {
    await _session.restore();
    if (!mounted || !_session.state.isAuthenticated) return;
    _onAuthenticated();
    unawaited(_session.refresh());
  }

  void _onAuthenticated() {
    _client.resetUnauthorizedSignal();
    unawaited(_initializePushNotifications());
    if (_realtime != null) unawaited(_realtime.connect());
    unawaited(_bloc.load());
    unawaited(_features.inbox.load());
    _router.router.go(AppRoutes.home);
  }

  Future<void> _initializePushNotifications() async {
    await _pushNotifications.initialize();
    final initial = _pushNotifications.takeInitialTarget();
    if (initial != null) _openNotification(initial);
  }

  void _openNotification(NotificationTarget target) {
    final location = NotificationLocation.of(target);
    if (location != null && mounted) _router.router.go(location);
  }

  Future<void> _logout() async {
    await _session.logout();
    await _pushNotifications.stop();
    await _realtime?.disconnectForLogout();
    if (mounted) _router.router.go(AppRoutes.login);
  }

  void _onUnauthorized() {
    unawaited(
      Future.wait([
        _session.unauthorized(),
        _pushNotifications.stop(),
        if (_realtime != null) _realtime.disconnectForLogout(),
      ]).then((_) {
        if (mounted) _router.router.go(AppRoutes.login);
      }),
    );
  }
}
