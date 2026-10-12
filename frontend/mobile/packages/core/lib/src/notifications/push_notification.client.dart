import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'package:core/src/network/api.client.dart';

class PushNotificationService {
  PushNotificationService(this._client);

  final ApiClient _client;
  StreamSubscription<String>? _tokenRefreshSubscription;

  Future<void> initialize() async {
    if (_tokenRefreshSubscription != null) return;
    await Firebase.initializeApp();
    await FirebaseMessaging.instance.requestPermission();
    final token = await FirebaseMessaging.instance.getToken();
    if (token != null) await _register(token);
    _tokenRefreshSubscription = FirebaseMessaging.instance.onTokenRefresh
        .listen(_register);
  }

  Future<void> _register(String token) => _client.post<void>(
    '/user/device-token',
    data: {'token': token, 'platform': 'android'},
    parser: (_) {},
  );

  Future<void> stop() async {
    await _tokenRefreshSubscription?.cancel();
    _tokenRefreshSubscription = null;
  }

  Future<void> dispose() => stop();
}
