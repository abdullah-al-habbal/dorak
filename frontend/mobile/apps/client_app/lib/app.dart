import 'dart:async';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/locale/locale.bloc.dart';
import 'package:client_app/src/core/locale/locale.event.dart';
import 'package:client_app/src/core/navigation/app.router.dart';
import 'package:client_app/src/core/navigation/app_services.provider.dart';
import 'package:client_app/src/core/navigation/notification_location.entity.dart';
import 'package:client_app/src/core/session/auth_coordination.entity.dart';
import 'package:client_app/src/features/auth/platform_social_credential.provider.dart';
import 'package:client_app/src/features/auth/social_credential.provider.dart';
import 'package:client_app/src/features/profile/image_picker_photo_picker.provider.dart';

class DorakApp extends StatefulWidget {
  final AppPreferences preferences;
  final TokenStorage? tokenStorage;
  final AuthRepository? authRepository;
  final ProfileRepository? profileRepository;
  final FeedCache? feedCache;
  final SocialCredentialProvider? socialCredentials;

  const DorakApp({
    super.key,
    required this.preferences,
    this.tokenStorage,
    this.authRepository,
    this.profileRepository,
    this.feedCache,
    this.socialCredentials,
  });

  @override
  State<DorakApp> createState() => _DorakAppState();
}

class _DorakAppState extends State<DorakApp> {
  late final TokenStorage _tokenStorage;
  late final ApiClient _apiClient;
  late final AuthBloc _authBloc;
  late final SessionBloc _sessionBloc;
  late final LocaleBloc _localeBloc;
  late final AppRouter _router;
  late final StreamSubscription<void> _unauthorizedSubscription;
  late final StreamSubscription<void> _accountBannedSubscription;
  late final StreamSubscription<AuthState> _authCoordinatorSubscription;
  late final AppLifecycleListener _lifecycleListener;
  late final PushNotificationService _pushNotifications;
  late final RealtimeClient? _realtime;
  late final StreamSubscription<SessionState> _realtimeSessionSubscription;
  late final StreamSubscription<NotificationTarget>
  _notificationOpenSubscription;
  String? _pendingNotificationLocation;

  @override
  void initState() {
    super.initState();
    _tokenStorage = widget.tokenStorage ?? SecureTokenStorage();
    _localeBloc = LocaleBloc();
    _apiClient = ApiClient(
      baseUrl: ConfigProvider.config.apiBaseV1Url,
      localeResolver: () => _localeBloc.state.languageCode,

      tokenProvider: _tokenStorage.read,
      enableLogging: kDebugMode,
    );
    _pushNotifications = PushNotificationService(_apiClient);
    _realtime = _createRealtime();
    _notificationOpenSubscription = _pushNotifications.opened.listen(
      _openNotification,
    );
    unawaited(_initializePushNotifications());
    final repository = widget.authRepository ?? DioAuthRepository(_apiClient);
    _authBloc = AuthBloc(repository, _tokenStorage);
    _sessionBloc = SessionBloc(
      repository,
      _tokenStorage,
      widget.profileRepository ?? DioProfileRepository(_apiClient),
    );
    unawaited(_sessionBloc.ready);

    _authCoordinatorSubscription = _authBloc.stream.listen(
      (authState) => coordinateAuthSuccess(authState, _sessionBloc),
    );

    _unauthorizedSubscription = _apiClient.unauthorizedStream.listen((_) {
      _sessionBloc.add(UnauthorizedDetected());
    });
    _accountBannedSubscription = _apiClient.accountBannedStream.listen((_) {
      _sessionBloc.add(AccountBannedDetected());
    });

    _realtimeSessionSubscription = _sessionBloc.stream.listen(
      _syncRealtimeWithSession,
    );

    _lifecycleListener = AppLifecycleListener(onResume: _probeSessionOnResume);

    _router = AppRouter(
      session: _sessionBloc,
      auth: _authBloc,
      preferences: widget.preferences,
      authRepository: repository,
      locale: _localeBloc,
      services: AppServices.live(
        apiClient: _apiClient,
        preferences: widget.preferences,
        authRepository: repository,
        feedCache: widget.feedCache,
      ),
      photoPicker: const ImagePickerPhotoPicker(),
      socialCredentials:
          widget.socialCredentials ?? PlatformSocialCredentialProvider(),
      switchLocale: _switchLocale,
      apiClient: _apiClient,
      realtime: _realtime,
    );
  }

  @override
  void dispose() {
    _lifecycleListener.dispose();
    _authCoordinatorSubscription.cancel();
    _realtimeSessionSubscription.cancel();
    _notificationOpenSubscription.cancel();
    _unauthorizedSubscription.cancel();
    _accountBannedSubscription.cancel();
    _router.dispose();
    _authBloc.close();
    _sessionBloc.close();
    _localeBloc.close();
    unawaited(_pushNotifications.dispose());
    _realtime?.dispose();
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

  Future<void> _initializePushNotifications() async {
    await _pushNotifications.initialize();
    final initial = _pushNotifications.takeInitialTarget();
    if (initial != null) _openNotification(initial);
  }

  /// Opens the screen for a tapped push. A guest first signs in, so the
  /// location is held and opened once the session becomes authenticated.
  void _openNotification(NotificationTarget target) {
    final location = NotificationLocation.of(target);
    if (location == null) return;
    if (_sessionBloc.state.status.isAuthenticated) {
      unawaited(_router.router.push<void>(location));
    } else {
      _pendingNotificationLocation = location;
    }
  }

  void _openPendingNotification(SessionState state) {
    final location = _pendingNotificationLocation;
    if (location == null || !state.status.isAuthenticated) return;
    _pendingNotificationLocation = null;
    unawaited(_router.router.push<void>(location));
  }

  void _syncRealtimeWithSession(SessionState state) {
    _openPendingNotification(state);
    final realtime = _realtime;
    if (realtime == null) return;
    if (state.status.isAuthenticated) {
      unawaited(realtime.connect());
    } else if (state.status == AuthStatus.guest) {
      unawaited(realtime.disconnectForLogout());
    }
  }

  void _switchLocale() {
    _localeBloc.add(LocaleToggled());
  }

  /// Re-probes the stored token whenever the app returns to the foreground.
  ///
  /// A session can die while the app is backgrounded — the token expires or is
  /// revoked server-side and nothing tells the client. Without this probe the
  /// app keeps rendering authenticated UI until some later request happens to
  /// return 401.
  ///
  /// See `docs/runtime/app_lifecycle.md`.
  void _probeSessionOnResume() {
    final session = _sessionBloc.state;

    // The startup restore owns the `unknown` status. Racing it would resolve
    // the session twice behind the splash's `session.ready` completer.
    if (session.status == AuthStatus.unknown) return;

    // A restore or logout is already running. `RestoreRequested` uses Bloc's
    // default concurrent transformer, so a second one would overlap the first.
    if (session.isLoading) return;

    _sessionBloc.add(RestoreRequested());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocaleBloc, Locale>(
      bloc: _localeBloc,
      builder: (context, locale) {
        return MaterialApp.router(
          title: 'Dorak',
          debugShowCheckedModeBanner: false,
          theme: DorakTheme.forLocale(locale, Brightness.light),
          darkTheme: DorakTheme.forLocale(locale, Brightness.dark),
          themeMode: ThemeMode.system,
          locale: locale,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          onGenerateTitle: (context) =>
              AppLocalizations.of(context)?.splashTitle ?? 'Dorak',
          routerConfig: _router.router,
        );
      },
    );
  }
}
