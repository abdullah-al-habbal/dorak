import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test(
    'floor plan chairs carry the seated barber services and the shop menu',
    () {
      final plan = FloorPlanDto.fromJson({
        'branch_id': 'branch-1',
        'branch_name': 'Royal',
        'chairs': [
          {
            'id': 'chair-1',
            'status': 'available',
            'services_source': 'barber',
            'barber': {
              'id': 'barber-1',
              'name': 'Karim',
              'services': [
                {'id': 's-1', 'name': 'Skin Fade', 'owner': 'barber'},
              ],
            },
          },
          {'id': 'chair-2', 'status': 'available', 'barber': null},
        ],
        'branch_services': [
          {'id': 's-9', 'name': 'Kids Cut', 'owner': 'brand'},
        ],
      });

      expect(plan.chairs.first.barber?.services.single.name, 'Skin Fade');
      expect(plan.chairs.first.servicesSource, 'barber');
      expect(plan.chairs.last.barber, isNull);
      expect(plan.chairs.last.servicesSource, 'branch');
      expect(plan.branchServices.single.owner, 'brand');
    },
  );

  test('barber detail parses workplaces', () {
    final barber = BarberProfileDto.fromJson({
      'id': 'barber-1',
      'name': 'Karim',
      'email': 'karim@example.com',
      'workplaces': [
        {
          'type': 'branch',
          'id': 'branch-1',
          'name': 'Royal',
          'chair_label': 'Chair 4',
        },
        {
          'type': 'brand',
          'id': 'brand-1',
          'name': 'Royal Group',
          'chair_label': null,
        },
      ],
    });

    expect(barber.workplaces, hasLength(2));
    expect(barber.workplaces.first.isBranch, isTrue);
    expect(barber.workplaces.first.chairLabel, 'Chair 4');
    expect(barber.workplaces.last.chairLabel, isNull);
  });
}
