import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('ClientDto', () {
    test('parses all eight client payload fields', () {
      final client = ClientDto.fromJson({
        'id': 'client-1',
        'name': 'Ahmad',
        'email': 'ahmad@example.com',
        'phone': '+966500000001',
        'avatar': 'https://cdn.example.com/avatars/a.jpg',
        'preferred_universe': 'women',
        'email_verified_at': '2026-09-01T09:30:00.000000Z',
        'created_at': '2026-08-01T08:00:00.000000Z',
      });

      expect(client.id, 'client-1');
      expect(client.name, 'Ahmad');
      expect(client.email, 'ahmad@example.com');
      expect(client.phone, '+966500000001');
      expect(client.avatar, 'https://cdn.example.com/avatars/a.jpg');
      expect(client.preferredUniverse, 'women');
      expect(client.emailVerifiedAt, DateTime.utc(2026, 9, 1, 9, 30));
      expect(client.createdAt, DateTime.utc(2026, 8, 1, 8));
      expect(client.emailVerified, isTrue);
    });

    test('an unverified client has a null emailVerifiedAt', () {
      final client = ClientDto.fromJson({
        'id': 'client-1',
        'name': 'Ahmad',
        'email': 'ahmad@example.com',
        'phone': null,
        'avatar': null,
        'preferred_universe': 'men',
        'email_verified_at': null,
        'created_at': '2026-08-01T08:00:00.000000Z',
      });

      expect(client.emailVerifiedAt, isNull);
      expect(client.emailVerified, isFalse);
      expect(client.avatar, isNull);
      expect(client.phone, isNull);
    });
  });
}
