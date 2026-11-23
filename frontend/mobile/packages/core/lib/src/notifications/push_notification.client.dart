import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

import 'package:core/src/external/app_info.provider.dart';
import 'package:core/src/network/api.client.dart';
import 'package:core/src/notifications/foreground_notification_presenter.provider.dart';
import 'package:core/src/notifications/local_foreground_notification.provider.dart';
import 'package:core/src/notifications/notification_target.entity.dart';
import 'package:core/src/notifications/push_background.client.dart';

class PushNotificationService {
  /// [initializeFirebase] and [platformName] default to the real Firebase
  /// bootstrap and the running platform; tests inject fakes. [localeResolver]
  /// reports the app language sent with the device token, so the backend writes
  /// each push in the language this device shows.
  PushNotificationService(
    this._client, {
    Future<void> Function()? initializeFirebase,
    String Function()? platformName,
    this._localeResolver,
    AppInfoProvider? appInfo,
    ForegroundNotificationPresenter? presenter,
  }) : _initializeFirebase = initializeFirebase ?? Firebase.initializeApp,
       _platformName = platformName ?? _runningPlatformName,
       _appInfo = appInfo ?? const PackageInfoAppInfoProvider(),
       _presenter = presenter ?? LocalForegroundNotificationPresenter();

  static const String _platformIos = 'ios';
  static const String _platformAndroid = 'android';

  final ApiClient _client;
  final Future<void> Function() _initializeFirebase;
  final String Function() _platformName;
  final String Function()? _localeResolver;
  final AppInfoProvider _appInfo;
  final ForegroundNotificationPresenter _presenter;
  StreamSubscription<String>? _tokenRefreshSubscription;
  StreamSubscription<RemoteMessage>? _openedSubscription;
  StreamSubscription<RemoteMessage>? _foregroundSubscription;
  String? _currentToken;
  final StreamController<NotificationTarget> _opened =
      StreamController<NotificationTarget>.broadcast();
  NotificationTarget? _initialTarget;

  /// Targets of notifications the user opened while the app was running.
  Stream<NotificationTarget> get opened => _opened.stream;

  /// The target of the notification that launched the app from a terminated
  /// state, returned once.
  NotificationTarget? takeInitialTarget() {
    final target = _initialTarget;
    _initialTarget = null;
    return target;
  }

  /// Emits the target for an opened notification's FCM `data` map.
  void handleOpenedData(Map<String, dynamic> data) {
    if (_opened.isClosed) return;
    _opened.add(NotificationTarget.fromPayload(data: data));
  }

  static String _runningPlatformName() =>
      defaultTargetPlatform == TargetPlatform.iOS
      ? _platformIos
      : _platformAndroid;

  /// Starts push delivery. Push is optional: when Firebase is not configured
  /// for this build (no `google-services.json` or `GoogleService-Info.plist`),
  /// the user declined notifications, or the platform refuses, the app keeps
  /// running without notifications and a later call may retry. Safe to call
  /// again after sign-in: the device token is registered once the API accepts
  /// it.
  Future<void> initialize() async {
    try {
      await _start();
    } on Object catch (error) {
      debugPrint('Push notifications unavailable: $error');
    }
  }

  Future<void> _start() async {
    await _initializeFirebase();
    await _listenOnce();
    if (_tokenRefreshSubscription != null) return;
    if (!await _permissionGranted()) return;
    final token = await FirebaseMessaging.instance.getToken();
    if (token != null) await registerToken(token);
    _tokenRefreshSubscription = FirebaseMessaging.instance.onTokenRefresh
        .listen(registerToken);
  }

  Future<void> _listenOnce() async {
    if (_openedSubscription != null) return;
    FirebaseMessaging.onBackgroundMessage(PushBackgroundHandler.handle);
    await _presenter.prepare(handleOpenedData);
    _foregroundSubscription = FirebaseMessaging.onMessage.listen(
      _showForeground,
    );
    _openedSubscription = FirebaseMessaging.onMessageOpenedApp.listen(
      (message) => handleOpenedData(message.data),
    );
    final initial = await FirebaseMessaging.instance.getInitialMessage();
    if (initial != null) {
      _initialTarget = NotificationTarget.fromPayload(data: initial.data);
    }
  }

  /// Asks once; a user who already declined is not prompted again.
  Future<bool> _permissionGranted() async {
    final messaging = FirebaseMessaging.instance;
    var settings = await messaging.getNotificationSettings();
    if (settings.authorizationStatus == AuthorizationStatus.notDetermined) {
      settings = await messaging.requestPermission();
    }
    return settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional;
  }

  Future<void> _showForeground(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;
    await _presenter.show(
      title: notification.title ?? '',
      body: notification.body ?? '',
      data: message.data,
    );
  }

  /// Registers (or refreshes) this device's token with the backend, with the
  /// app language and version so pushes are written in the device language.
  @visibleForTesting
  Future<void> registerToken(String token) async {
    _currentToken = token;
    final locale = _localeResolver?.call();
    final version = await _appInfo.version();
    await _client.post<void>(
      '/user/device-token',
      data: {
        'token': token,
        'platform_type': _platformName(),
        if (locale != null && locale.isNotEmpty) 'locale': locale,
        if (version.isNotEmpty) 'app_version': version,
      },
      parser: (_) {},
    );
  }

  /// Re-sends the current token, for example after the user switched language.
  Future<void> refreshRegistration() async {
    final token = _currentToken;
    if (token == null) return;
    try {
      await registerToken(token);
    } on Object catch (error) {
      debugPrint('Push registration refresh failed: $error');
    }
  }

  Future<void> stop() async {
    await _tokenRefreshSubscription?.cancel();
    _tokenRefreshSubscription = null;
    await _openedSubscription?.cancel();
    _openedSubscription = null;
    await _foregroundSubscription?.cancel();
    _foregroundSubscription = null;
    _currentToken = null;
  }

  Future<void> dispose() async {
    await stop();
    await _opened.close();
  }
}
