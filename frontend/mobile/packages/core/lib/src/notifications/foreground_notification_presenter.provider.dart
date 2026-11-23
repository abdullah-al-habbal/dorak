/// Shows a push that arrives while the app is open, and reports a tap on it.
/// An abstract seam so tests and builds without the plugin never touch it.
abstract class ForegroundNotificationPresenter {
  /// Prepares the presenter; [onTapped] receives the FCM `data` map of a tapped
  /// notification.
  Future<void> prepare(void Function(Map<String, dynamic> data) onTapped);

  Future<void> show({
    required String title,
    required String body,
    required Map<String, dynamic> data,
  });
}
