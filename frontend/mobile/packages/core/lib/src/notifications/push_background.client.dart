import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

/// Entry point FCM runs in a background isolate. Messages that carry a
/// `notification` block are shown by the system, so this only has to make sure
/// Firebase is available there; it never throws.
class PushBackgroundHandler {
  const PushBackgroundHandler._();

  @pragma('vm:entry-point')
  static Future<void> handle(RemoteMessage message) async {
    try {
      await Firebase.initializeApp();
    } on Object {
      // Not configured for this build: nothing to do in the background.
    }
  }
}
