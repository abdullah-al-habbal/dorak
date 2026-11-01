import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, dynamic> branchJson(Map<String, dynamic> extra) => {
  'id': '01a1647f-a5d1-7017-8546-91692fff18ec',
  'name': 'Downtown',
  'email': 'downtown@example.com',
  'status': 'enabled',
  'latitude': 33.5,
  'longitude': 36.3,
  'brand_id': '01a1647f-a5d1-7017-8546-000000000001',
  ...extra,
};

void main() {
  test('branch list items parse UUID ids and the stored rating', () {
    final branch = BranchDto.fromJson(
      branchJson({'rating_avg': 4.33, 'rating_count': 3, 'universe': 'unisex'}),
    );

    expect(branch.id, '01a1647f-a5d1-7017-8546-91692fff18ec');
    expect(branch.brandId, '01a1647f-a5d1-7017-8546-000000000001');
    expect(branch.ratingAvg, 4.33);
    expect(branch.ratingCount, 3);
    expect(branch.universe, VenueUniverse.unisex);
  });

  test('branch detail and barber profile default to unrated', () {
    final detail = BranchDetailDto.fromJson(branchJson({}));
    final barber = BarberProfileDto.fromJson({
      'id': 'barber-1',
      'name': 'Karim',
      'email': 'karim@example.com',
      'rating_avg': null,
      'rating_count': 0,
    });

    expect(detail.ratingAvg, isNull);
    expect(detail.ratingCount, 0);
    expect(barber.ratingAvg, isNull);
    expect(barber.ratingCount, 0);
  });

  test('barber profile parses an integer average as a double', () {
    final barber = BarberProfileDto.fromJson({
      'id': 'barber-1',
      'name': 'Karim',
      'email': 'karim@example.com',
      'rating_avg': 3,
      'rating_count': 1,
    });

    expect(barber.ratingAvg, 3.0);
  });
}
