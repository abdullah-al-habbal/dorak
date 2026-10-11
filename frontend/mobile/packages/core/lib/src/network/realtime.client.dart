import 'package:laravel_reverb/laravel_reverb.dart';

import 'package:core/src/network/realtime_channels.entity.dart';
import 'package:core/src/network/realtime_configuration.entity.dart';
import 'package:core/src/network/realtime_subscription.entity.dart';

class RealtimeClient {
  RealtimeClient({
    required RealtimeConfiguration configuration,
    required Future<String?> Function() tokenProvider,
    void Function(Object error, StackTrace? stackTrace)? onError,
  }) : _reverb = _buildReverb(configuration, tokenProvider, onError);

  final Reverb _reverb;

  static Reverb _buildReverb(
    RealtimeConfiguration configuration,
    Future<String?> Function() tokenProvider,
    void Function(Object error, StackTrace? stackTrace)? onError,
  ) {
    if (configuration.appKey.trim().isEmpty ||
        configuration.host.trim().isEmpty) {
      throw ArgumentError(
        'REVERB_APP_KEY and REVERB_HOST must be configured before connecting.',
      );
    }
    return Reverb(
      host: configuration.host,
      port: configuration.port,
      appKey: configuration.appKey,
      useTls: configuration.useTls,
      path: configuration.serverPath,
      authEndpoint: configuration.authEndpoint,
      authHeaders: () async {
        final token = await tokenProvider();
        if (token == null || token.trim().isEmpty) {
          throw StateError('A Sanctum bearer token is required for Reverb.');
        }
        return <String, String>{
          'Accept': 'application/json',
          'Authorization': 'Bearer $token',
        };
      },
      onError: onError,
    );
  }

  Future<void> connect() => _reverb.connect();

  RealtimeSubscription subscribeToBranch(
    String branchId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) => _subscribe(RealtimeChannels.branch(branchId), onEvent);

  RealtimeSubscription subscribeToBarber(
    String barberId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) => _subscribe(RealtimeChannels.barber(barberId), onEvent);

  Future<void> disconnectForLogout() => _reverb.disconnect(forget: true);

  void dispose() => _reverb.dispose();

  RealtimeSubscription _subscribe(
    String channel,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) => RealtimeSubscription(_reverb.private(channel).listenAll(onEvent));
}
