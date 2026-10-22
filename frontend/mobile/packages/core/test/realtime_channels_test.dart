import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('RealtimeChannels', () {
    test('builds the Laravel branch channel without a duplicate prefix', () {
      expect(RealtimeChannels.branch('branch-1'), 'branch.branch-1');
    });

    test('builds the Laravel barber channel without a duplicate prefix', () {
      expect(RealtimeChannels.barber('barber-1'), 'barber.barber-1');
    });

    test('builds the Laravel client channel without a duplicate prefix', () {
      expect(RealtimeChannels.client('client-1'), 'client.client-1');
    });
  });

  test('RealtimeConfiguration keeps the backend authorization endpoint', () {
    const configuration = RealtimeConfiguration(
      appKey: 'public-key',
      host: 'reverb.example.test',
      port: 443,
      useTls: true,
      authEndpoint: 'https://api.example.test/api/v1/broadcasting/auth',
    );

    expect(configuration.authEndpoint, endsWith('/broadcasting/auth'));
    expect(configuration.useTls, isTrue);
  });
}
