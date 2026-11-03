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
        {
          'day_of_week': 5,
          'is_closed': true,
          'opens_time': null,
          'closes_time': null,
        },
      ],
      'today_hours': {
        'date': '2026-10-24',
        'is_closed': false,
        'opens_time': '12:00',
        'closes_time': '16:00',
        'source': 'override',
      },
    });

    expect(detail.address, 'Main St');
    expect(detail.tags, ['kids']);
    expect(detail.openingHours.single.isClosed, isTrue);
    expect(detail.todayHours?.opensTime, '12:00');
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

  const base = {
    'id': 'b1',
    'name': 'Main',
    'email': 'main@example.com',
    'latitude': 33.5,
    'longitude': 36.3,
    'brand_id': 'brand-1',
  };

  test('branch status and universe parse to enums', () {
    final branch = BranchDto.fromJson({
      ...base,
      'status': 'enabled',
      'universe': 'women',
    });

    expect(branch.status, BranchStatus.enabled);
    expect(branch.universe, VenueUniverse.women);
  });

  test('unknown status falls back to pending and unknown universe to null', () {
    final branch = BranchDto.fromJson({
      ...base,
      'status': 'archived',
      'universe': 'kids',
    });

    expect(branch.status, BranchStatus.pending);
    expect(branch.universe, isNull);
  });

  test('branch DTOs accept a branch without coordinates', () {
    const base = {
      'id': 'b2',
      'name': 'No pin',
      'email': 'nopin@example.com',
      'status': 'enabled',
      'brand_id': 'brand-1',
    };

    final branch = BranchDto.fromJson({
      ...base,
      'latitude': null,
      'longitude': null,
    });
    final detail = BranchDetailDto.fromJson({
      ...base,
      'chairs_count': 0,
      'barbers': <dynamic>[],
      'services': <dynamic>[],
    });

    expect(branch.latitude, isNull);
    expect(branch.longitude, isNull);
    expect(detail.latitude, isNull);
    expect(detail.longitude, isNull);
  });
}
