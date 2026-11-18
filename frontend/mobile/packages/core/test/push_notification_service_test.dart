import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('PushNotificationService.initialize', () {
    test('keeps the app running when Firebase is not configured', () async {
      final fake = fakeDio(handler: jsonResponse);
      var attempts = 0;
      final service = PushNotificationService(
        clientWith(fake),
        initializeFirebase: () async {
          attempts++;
          throw StateError('No Firebase App has been created');
        },
      );

      await service.initialize();

      expect(attempts, 1);
      expect(fake.callCount, 0);
      expect(service.takeInitialTarget(), isNull);
    });

    test('a failed start can be retried', () async {
      final fake = fakeDio(handler: jsonResponse);
      var attempts = 0;
      final service = PushNotificationService(
        clientWith(fake),
        initializeFirebase: () async {
          attempts++;
          throw StateError('not configured');
        },
      );

      await service.initialize();
      await service.initialize();

      expect(attempts, 2);
    });
  });
}
