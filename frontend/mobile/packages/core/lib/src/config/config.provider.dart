import 'package:core/src/config/app_config.entity.dart';
import 'package:core/src/network/realtime_configuration.entity.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ConfigProvider {
  static AppConfig get config {
    if (!dotenv.isInitialized) {
      throw StateError(
        'dotenv not loaded. Call await dotenv.load() in main() before accessing config.',
      );
    }
    return AppConfig(
      apiBaseUrl: dotenv.get('API_BASE_URL'),
      apiBaseV1Url: dotenv.get('API_BASE_URL_V1'),
      reverbAppKey: dotenv.get('REVERB_APP_KEY', fallback: ''),
      reverbHost: dotenv.get('REVERB_HOST', fallback: ''),
      reverbPort: int.parse(dotenv.get('REVERB_PORT', fallback: '443')),
      reverbScheme: dotenv.get('REVERB_SCHEME', fallback: 'https'),
      reverbServerPath: dotenv.get('REVERB_SERVER_PATH', fallback: ''),
    );
  }

  static RealtimeConfiguration get realtimeConfiguration {
    final config = ConfigProvider.config;
    return RealtimeConfiguration(
      appKey: config.reverbAppKey,
      host: config.reverbHost,
      port: config.reverbPort,
      useTls: config.reverbScheme == 'https' || config.reverbScheme == 'wss',
      authEndpoint: '${config.apiBaseV1Url}/broadcasting/auth',
      serverPath: config.reverbServerPath,
    );
  }
}
