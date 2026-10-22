import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'package:core/src/network/api.client.dart';
import 'package:core/src/notifications/notification_target.entity.dart';

class PushNotificationService {
  PushNotificationService(this._client);

  final ApiClient _client;
  StreamSubscription<String>? _tokenRefreshSubscription;
  StreamSubscription<RemoteMessage>? _openedSubscription;
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

  Future<void> initialize() async {
    if (_tokenRefreshSubscription != null) return;
    await Firebase.initializeApp();
    await FirebaseMessaging.instance.requestPermission();
    final token = await FirebaseMessaging.instance.getToken();
    if (token != null) await _register(token);
    _tokenRefreshSubscription = FirebaseMessaging.instance.onTokenRefresh
        .listen(_register);
    _openedSubscription = FirebaseMessaging.onMessageOpenedApp.listen(
      (message) => handleOpenedData(message.data),
    );
    final initial = await FirebaseMessaging.instance.getInitialMessage();
    if (initial != null) {
      _initialTarget = NotificationTarget.fromPayload(data: initial.data);
    }
  }

  Future<void> _register(String token) => _client.post<void>(
    '/user/device-token',
    data: {'token': token, 'platform': 'android'},
    parser: (_) {},
  );

  Future<void> stop() async {
    await _tokenRefreshSubscription?.cancel();
    _tokenRefreshSubscription = null;
    await _openedSubscription?.cancel();
    _openedSubscription = null;
  }

  Future<void> dispose() async {
    await stop();
    await _opened.close();
  }
}
