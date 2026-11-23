import 'dart:convert';

import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'package:core/src/notifications/foreground_notification_presenter.provider.dart';

/// Shows foreground pushes as system notifications on the same channel the
/// backend names in its Android payload (`dorak_default`).
class LocalForegroundNotificationPresenter
    implements ForegroundNotificationPresenter {
  LocalForegroundNotificationPresenter({
    FlutterLocalNotificationsPlugin? plugin,
  }) : _plugin = plugin ?? FlutterLocalNotificationsPlugin();

  static const String channelId = 'dorak_default';
  static const String _channelName = 'Dorak notifications';
  static const String _androidIcon = '@mipmap/ic_launcher';

  final FlutterLocalNotificationsPlugin _plugin;
  int _nextId = 0;

  @override
  Future<void> prepare(
    void Function(Map<String, dynamic> data) onTapped,
  ) async {
    await _plugin.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings(_androidIcon),
        iOS: DarwinInitializationSettings(
          requestAlertPermission: false,
          requestBadgePermission: false,
          requestSoundPermission: false,
        ),
      ),
      onDidReceiveNotificationResponse: (response) =>
          onTapped(_decode(response.payload)),
    );
    await _plugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(
          const AndroidNotificationChannel(
            channelId,
            _channelName,
            importance: Importance.high,
          ),
        );
  }

  @override
  Future<void> show({
    required String title,
    required String body,
    required Map<String, dynamic> data,
  }) => _plugin.show(
    id: _nextId++,
    title: title,
    body: body,
    notificationDetails: const NotificationDetails(
      android: AndroidNotificationDetails(
        channelId,
        _channelName,
        importance: Importance.high,
        priority: Priority.high,
      ),
      iOS: DarwinNotificationDetails(),
    ),
    payload: jsonEncode(data),
  );

  static Map<String, dynamic> _decode(String? payload) {
    if (payload == null || payload.isEmpty) return const {};
    try {
      final decoded = jsonDecode(payload);
      return decoded is Map<String, dynamic> ? decoded : const {};
    } on FormatException {
      return const {};
    }
  }
}
