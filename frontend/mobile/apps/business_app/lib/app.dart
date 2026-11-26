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
import 'package:business_app/src/features/earnings/business_earnings.bloc.dart';
import 'package:business_app/src/features/hours/business_hours.bloc.dart';
import 'package:business_app/src/features/inbox/business_inbox.bloc.dart';
import 'package:business_app/src/features/jobs/business_jobs.bloc.dart';
import 'package:business_app/src/features/profile/business_profile.bloc.dart';
import 'package:business_app/src/features/reviews/business_reviews.bloc.dart';
import 'package:business_app/src/features/session/brand_suspension.provider.dart';
import 'package:business_app/src/features/services/business_services.bloc.dart';
import 'package:business_app/src/features/staff/business_staff.bloc.dart';
import 'package:business_app/src/core/navigation/notification_location.entity.dart';
import 'package:business_app/src/core/locale/app_locales.entity.dart';
import 'package:business_app/src/core/owner_feature_blocs.provider.dart';
import 'package:business_app/src/features/owner/app_role.entity.dart';
import 'package:business_app/src/features/owner/app_role.provider.dart';
import 'package:business_app/src/features/owner/owner_auth.repository.dart';
import 'package:business_app/src/features/owner/owner_billing.bloc.dart';
import 'package:business_app/src/features/owner/owner_branches.bloc.dart';
import 'package:business_app/src/features/owner/owner_home.bloc.dart';
import 'package:business_app/src/features/owner/owner_services.bloc.dart';
import 'package:business_app/src/features/owner/role_auth.repository.dart';
import 'package:business_app/src/features/owner/shared_preferences_app_role.provider.dart';

class DorakBusinessApp extends StatefulWidget {
  const DorakBusinessApp({
    super.key,
    this.tokenStorage,
    this.repository,
    this.roleProvider,
  });

  final AppRoleProvider? roleProvider;
  final TokenStorage? tokenStorage;
  final ManagedBarberRepository? repository;

  @override
  State<DorakBusinessApp> createState() => _DorakBusinessAppState();
}

class _DorakBusinessAppState extends State<DorakBusinessApp> {
  Locale _locale = AppLocales.english;
  late final TokenStorage _tokenStorage;
  late final ApiClient _apiClient;
  late final ManualBarberBloc _barbers;
  late final BranchOperationsBloc _operations;
  late final BusinessFeatureBlocs _features;
  late final RealtimeClient? _realtime;
  late final PushNotificationService _pushNotifications;
  late final BusinessAppRouter _router;
  late final StaffSessionBloc _session;
  late final RoleAuthRepository _roles;
  late final OwnerFeatureBlocs _owner;
  late final ExternalLinkOpener _linkOpener;
  late final LegalLinks _legalLinks;
  late final StaffPasswordResetBloc _passwordReset;
  late final StaffSessionSignals _sessionSignals;
  late final BrandSuspensionMonitor _brandSuspension;
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
    _pushNotifications = PushNotificationService(
      _apiClient,
      localeResolver: () => _locale.languageCode,
    );
    _notificationOpenSubscription = _pushNotifications.opened.listen(
      _openNotification,
    );
    final staffAuth = DioStaffAuthRepository(
      _apiClient,
      StaffAuthRoutes.branch(),
    );
    _roles = RoleAuthRepository(
      branch: staffAuth,
      owner: OwnerAuthRepository(DioAuthRepository(_apiClient)),
      roles: widget.roleProvider ?? const SharedPreferencesAppRoleProvider(),
    );
    _session = StaffSessionBloc(_roles, _tokenStorage);
    _passwordReset = StaffPasswordResetBloc(_roles);
    _sessionSignals = StaffSessionSignals(
      client: _apiClient,
      session: _session,
      onSessionEnded: _onSessionEnded,
    );
    final ownerApi = DioOwnerRepository(_apiClient);
    _owner = OwnerFeatureBlocs(
      home: OwnerHomeCubit(ownerApi),
      branches: OwnerBranchesCubit(ownerApi),
      billing: OwnerBillingCubit(ownerApi),
      services: OwnerServicesCubit(
        DioBranchServiceRepository(_apiClient, ApiEndpoints.owner.services),
      ),
    );
    _linkOpener = const UrlLauncherExternalLinkOpener();
    _legalLinks = LegalLinks.fromApiBaseUrl(ConfigProvider.config.apiBaseUrl);
    _brandSuspension = BrandSuspensionMonitor(
      client: _apiClient,
      realtime: _realtime,
      role: () => _roles.role,
      branch: DioBranchOperationsRepository(_apiClient),
      owner: ownerApi,
      ownerHome: _owner.home,
      onBranchSuspended: _sessionSignals.brandSuspended,
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
      profile: BusinessProfileBloc(
        management,
        DioBranchHoursRepository(_apiClient),
      ),
      reviews: BusinessReviewsBloc(
        management,
        DioBranchReviewDisputeRepository(_apiClient),
      ),
      staff: BusinessStaffBloc(
        DioBranchStaffRepository(_apiClient),
        widget.repository ?? DioManagedBarberRepository(_apiClient),
      ),
      services: BusinessServicesBloc(DioBranchServiceRepository(_apiClient)),
      hours: BusinessHoursBloc(DioBranchHoursRepository(_apiClient)),
      inbox: BusinessInboxBloc(DioNotificationRepository(_apiClient)),
      earnings: BusinessEarningsBloc(DioEarningsRepository.branch(_apiClient)),
      feedback: FeedbackBloc(
        DioFeedbackRepository(_apiClient),
        FeedbackApp.business,
      ),
    );
    _router = BusinessAppRouter(
      operations: _operations,
      features: _features,
      barbers: _barbers,
      session: _session,
      passwordReset: _passwordReset,
      onLocaleToggle: _toggleLocale,
      onLogout: _logout,
      onAuthenticated: _onAuthenticated,
      owner: _owner,
      roles: _roles,
      onRegisterAsOwner: _openOwnerRegistration,
    );
    unawaited(_restoreSession());
  }

  @override
  void dispose() {
    _barbers.close();
    _operations.close();
    unawaited(_features.close());
    unawaited(_owner.close());
    _router.dispose();
    _session.close();
    _passwordReset.close();
    unawaited(_sessionSignals.dispose());
    unawaited(_brandSuspension.dispose());
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

  void _toggleLocale() {
    setState(
      () => _locale = _locale.languageCode == AppLocales.englishCode
          ? AppLocales.arabic
          : AppLocales.english,
    );
    unawaited(_pushNotifications.refreshRegistration());
  }

  void _openOwnerRegistration() =>
      unawaited(_linkOpener.open(_legalLinks.ownerRegistration));

  Future<void> _restoreSession() async {
    await _roles.restoreRole();
    await _session.restore();
    if (!mounted || !_session.state.isAuthenticated) return;
    _onAuthenticated();
    unawaited(_session.refresh());
  }

  void _onAuthenticated() {
    _apiClient.resetUnauthorizedSignal();
    if (_realtime != null) unawaited(_realtime.connect());
    unawaited(_brandSuspension.start());
    if (_roles.role == AppRole.owner) {
      _router.router.go(AppRoutes.ownerHome);
      return;
    }
    unawaited(_features.inbox.load());
    unawaited(_initializePushNotifications());
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
    _brandSuspension.stop();
    await _session.logout();
    await _pushNotifications.stop();
    await _realtime?.disconnectForLogout();
    if (mounted) _router.router.go(AppRoutes.login);
  }

  /// Teardown after the session is already gone: expired, banned or deleted.
  Future<void> _onSessionEnded() async {
    _brandSuspension.stop();
    await Future.wait([
      _pushNotifications.stop(),
      if (_realtime != null) _realtime.disconnectForLogout(),
    ]);
    if (mounted) _router.router.go(AppRoutes.login);
  }
}
