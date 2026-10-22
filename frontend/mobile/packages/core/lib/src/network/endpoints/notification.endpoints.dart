class NotificationEndpoints {
  NotificationEndpoints._();

  static const String notifications = '/notifications';
  static const String markRead = '/notifications/{notification}/read';
  static const String markAllRead = '/notifications/read-all';
}
