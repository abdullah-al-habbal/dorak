import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('a branch result parses its entity as a branch', () {
    final item = ExploreSearchItemDto.fromJson({
      'type': 'branch',
      'distance': 0.4,
      'entity': {
        'id': 'branch-1',
        'name': 'Royal',
        'email': 'royal@example.com',
        'status': 'enabled',
        'latitude': 33.5,
        'longitude': 36.3,
        'brand_id': 'brand-1',
      },
    });

    expect(item.branch?.name, 'Royal');
    expect(item.barber, isNull);
    expect(item.isBarber, isFalse);
    expect(item.id, 'branch-1');
    expect(item.distance, 0.4);
  });

  test('a freelancer result parses its entity as a barber', () {
    final item = ExploreSearchItemDto.fromJson({
      'type': 'barber',
      'distance': null,
      'entity': {
        'id': 'barber-1',
        'name': 'Karim',
        'email': 'karim@example.com',
        'is_freelancer': true,
      },
    });

    expect(item.isBarber, isTrue);
    expect(item.barber?.name, 'Karim');
    expect(item.branch, isNull);
    expect(item.distance, isNull);
  });
}
