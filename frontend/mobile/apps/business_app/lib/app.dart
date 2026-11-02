import 'dart:async';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/core/business_feature_blocs.provider.dart';
import 'package:business_app/src/core/navigation/app.router.dart';
import 'package:business_app/src/core/navigation/app_routes.entity.dart';
import 'package:business_app/src/features/affiliations/business_affiliations.bloc.dart';
import 'package:business_app/src/features/floor_plan/business_floor_plan.bloc.dart';
import 'package:business_app/src/features/jobs/business_jobs.bloc.dart';
import 'package:business_app/src/features/profile/business_profile.bloc.dart';
import 'package:business_app/src/features/reviews/business_reviews.bloc.dart';
import 'package:business_app/src/core/navigation/notification_location.entity.dart';

class DorakBusinessApp extends StatefulWidget {
  const DorakBusinessApp({super.key, this.tokenStorage, this.repository});

  final TokenStorage? tokenStorage;
  final ManagedBarberRepository? repository;

  @override
  State<DorakBusinessApp> createState() => _DorakBusinessAppState();
}

class _DorakBusinessAppState extends State<DorakBusinessApp> {
  Locale _locale = const Locale('en');
  late final TokenStorage _tokenStorage;
  late final ApiClient _apiClient;
  late final ManualBarberBloc _barbers;
  late final BranchOperationsBloc _operations;
  late final BusinessFeatureBlocs _features;
  late final RealtimeClient? _realtime;
  late final PushNotificationService _pushNotifications;
  late final BusinessAppRouter _router;
  late final StaffSessionBloc _session;
  late final StreamSubscription<void> _unauthorizedSubscription;
  late final StreamSubscription<NotificationTarget>
  _notificationOpenSubscription;

  @override
  void initState() {
    super.initState();
    _tokenStorage = widget.tokenStorage ?? SecureBranchTokenStorage();
    _apiClient = ApiClient(
      baseUrl: ConfigProvider.config.apiBaseV1Url,
      tokenProvider: _tokenStorage.read,
      localeResolver: () => _locale.languageCode,
    );
    _realtime = _createRealtime();
    _pushNotifications = PushNotificationService(_apiClient);
    _notificationOpenSubscription = _pushNotifications.opened.listen(
      _openNotification,
    );
    _session = StaffSessionBloc(
      DioStaffAuthRepository(_apiClient, ApiEndpoints.branchAuth.login),
      _tokenStorage,
    );
    _unauthorizedSubscription = _apiClient.unauthorizedStream.listen(
      (_) => _onUnauthorized(),
    );
    _barbers = ManualBarberBloc(
      widget.repository ?? DioManagedBarberRepository(_apiClient),
    );
    _operations = BranchOperationsBloc(
      DioBranchOperationsRepository(_apiClient),
      realtime: _realtime,
    );
    final management = DioBranchManagementRepository(_apiClient);
    _features = BusinessFeatureBlocs(
      jobs: BusinessJobsBloc(DioJobPostingRepository(_apiClient)),
      floorPlan: BusinessFloorPlanBloc(management),
      affiliations: BusinessAffiliationsBloc(
        DioAffiliationRepository(_apiClient),
      ),
      profile: BusinessProfileBloc(management),
      reviews: BusinessReviewsBloc(
        management,
        DioBranchReviewDisputeRepository(_apiClient),
      ),
    );
    _router = BusinessAppRouter(
      operations: _operations,
      features: _features,
      barbers: _barbers,
      session: _session,
      onLocaleToggle: _toggleLocale,
      onLogout: _logout,
      onAuthenticated: _onAuthenticated,
    );
    unawaited(_restoreSession());
  }

  @override
  void dispose() {
    _barbers.close();
    _operations.close();
    unawaited(_features.close());
    _router.dispose();
    _session.close();
    _unauthorizedSubscription.cancel();
    _notificationOpenSubscription.cancel();
    _realtime?.dispose();
    unawaited(_pushNotifications.dispose());
    _apiClient.dispose();
    super.dispose();
  }

  RealtimeClient? _createRealtime() {
    final configuration = ConfigProvider.realtimeConfiguration;
    if (configuration.appKey.isEmpty || configuration.host.isEmpty) return null;
    return RealtimeClient(
      configuration: configuration,
      tokenProvider: _tokenStorage.read,
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      locale: _locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      theme: DorakTheme.forLocale(_locale, Brightness.light),
      routerConfig: _router.router,
      builder: (context, child) => MultiBlocProvider(
        providers: [
          BlocProvider.value(value: _operations),
          BlocProvider.value(value: _barbers),
          BlocProvider.value(value: _session),
        ],
        child: child!,
      ),
    );
  }

  void _toggleLocale() => setState(
    () => _locale = _locale.languageCode == 'en'
        ? const Locale('ar')
        : const Locale('en'),
  );

  Future<void> _restoreSession() async {
    await _session.restore();
    if (mounted && _session.state.isAuthenticated) _onAuthenticated();
  }

  void _onAuthenticated() {
    _apiClient.resetUnauthorizedSignal();
    unawaited(_initializePushNotifications());
    if (_realtime != null) unawaited(_realtime.connect());
    _router.router.go(AppRoutes.operations);
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
