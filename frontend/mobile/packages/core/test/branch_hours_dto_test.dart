import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('branch detail parses storefront fields and hours', () {
    final detail = BranchDetailDto.fromJson({
      'id': 'b1',
      'name': 'Main',
      'email': 'main@example.com',
      'status': 'enabled',
      'latitude': 33.5,
      'longitude': 36.3,
      'brand_id': 'brand-1',
      'chairs_count': 0,
      'barbers': <dynamic>[],
      'services': <dynamic>[],
      'description': 'Classic cuts',
      'address': 'Main St',
      'tags': ['kids'],
      'opening_hours': [
        {'weekday': 5, 'is_closed': true, 'opens_at': null, 'closes_at': null},
      ],
      'today_hours': {
        'date': '2026-10-24',
        'is_closed': false,
        'opens_at': '12:00',
        'closes_at': '16:00',
        'source': 'override',
      },
    });

    expect(detail.address, 'Main St');
    expect(detail.tags, ['kids']);
    expect(detail.openingHours.single.isClosed, isTrue);
    expect(detail.todayHours?.opensAt, '12:00');
    expect(detail.todayHours?.source, BranchHoursSource.override);
  });

  test('missing storefront fields default to empty', () {
    final detail = BranchDetailDto.fromJson({
      'id': 'b1',
      'name': 'Main',
      'email': 'main@example.com',
      'status': 'enabled',
      'latitude': 33.5,
      'longitude': 36.3,
      'brand_id': 'brand-1',
      'chairs_count': 0,
      'barbers': <dynamic>[],
      'services': <dynamic>[],
    });

    expect(detail.description, isNull);
    expect(detail.openingHours, isEmpty);
    expect(detail.todayHours, isNull);
  });
}
