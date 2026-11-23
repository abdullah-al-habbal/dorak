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

  group('PushNotificationService.registerToken', () {
    test('sends the platform, app language and app version', () async {
      Map<String, dynamic>? body;
      final fake = fakeDio(
        handler: (options) {
          body = options.data as Map<String, dynamic>?;
          return jsonResponse(
            options,
            data: successEnvelope(data: {'id': 'd1'}),
          );
        },
      );
      final service = PushNotificationService(
        clientWith(fake),
        platformName: () => 'ios',
        localeResolver: () => 'ar',
        appInfo: const _FixedAppInfo('1.4.2+7'),
      );

      await service.registerToken('device-token');

      expect(body, {
        'token': 'device-token',
        'platform_type': 'ios',
        'locale': 'ar',
        'app_version': '1.4.2+7',
      });
    });

    test('leaves out the language and version when they are unknown', () async {
      Map<String, dynamic>? body;
      final fake = fakeDio(
        handler: (options) {
          body = options.data as Map<String, dynamic>?;
          return jsonResponse(
            options,
            data: successEnvelope(data: {'id': 'd1'}),
          );
        },
      );
      final service = PushNotificationService(
        clientWith(fake),
        platformName: () => 'android',
        appInfo: const _FixedAppInfo(''),
      );

      await service.registerToken('device-token');

      expect(body, {'token': 'device-token', 'platform_type': 'android'});
    });
  });
}

class _FixedAppInfo implements AppInfoProvider {
  const _FixedAppInfo(this._version);

  final String _version;

  @override
  Future<String> version() async => _version;
}
