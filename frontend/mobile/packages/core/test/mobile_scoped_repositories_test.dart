import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  late RequestOptions captured;

  ApiClient clientReturning(Object? data, {Map<String, dynamic>? meta}) {
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return jsonResponse(
          options,
          data: successEnvelope(data: data, meta: meta),
        );
      },
    );
    return clientWith(fake);
  }

  test('reads opening hours from the branch profile', () async {
    final repository = DioBranchHoursRepository(
      clientReturning({
        'id': 'b1',
        'name': 'Main',
        'brand_id': 'brand-1',
        'opening_hours': [
          {
            'day_of_week': 1,
            'is_closed': false,
            'opens_time': '09:00',
            'closes_time': '18:00',
          },
          {'day_of_week': 2, 'is_closed': true},
        ],
      }),
    );

    final profile = await repository.getProfile();

    expect(captured.path, BranchEndpoints.profile);
    expect(profile.brandId, 'brand-1');
    expect(profile.openingHours.map((hour) => hour.isClosed), [false, true]);
    expect(profile.openingHours.first.opensTime, '09:00');
  });

  test('puts the week and omits times for a closed day', () async {
    final repository = DioBranchHoursRepository(clientReturning(null));

    await repository.updateOpeningHours(const [
      BranchOpeningHourDto(
        dayOfWeek: 1,
        opensTime: '09:00',
        closesTime: '17:30',
      ),
      BranchOpeningHourDto(dayOfWeek: 2, isClosed: true),
    ]);

    expect(captured.method, 'PUT');
    expect(captured.path, BranchEndpoints.openingHours);
    expect(captured.data, {
      'hours': [
        {
          'day_of_week': 1,
          'is_closed': false,
          'opens_time': '09:00',
          'closes_time': '17:30',
        },
        {'day_of_week': 2, 'is_closed': true},
      ],
    });
  });

  test('creates a brand service with minor-unit price', () async {
    final repository = DioBranchServiceRepository(
      clientReturning({
        'id': 's1',
        'serviceable_id': 'brand-1',
        'name': 'Haircut',
        'price_amount_minor': 2500,
        'currency_code': 'USD',
        'duration_minutes': 30,
      }),
    );

    final service = await repository.createService(
      brandId: 'brand-1',
      name: {'en': 'Haircut', 'ar': 'قص شعر'},
      price: 25,
      currencyCode: 'USD',
      durationMinutes: 30,
    );

    expect(captured.method, 'POST');
    expect(captured.path, BranchEndpoints.services);
    expect(captured.data, {
      'serviceable_id': 'brand-1',
      'serviceable_type': 'brand',
      'name': {'en': 'Haircut', 'ar': 'قص شعر'},
      'price_amount_minor': 2500,
      'currency_code': 'USD',
      'duration_minutes': 30,
      'is_at_home': false,
      'is_active': true,
    });
    expect(service.priceAmountMinor, 2500);
    expect(service.isActive, isTrue);
  });

  test('updates and deletes a service by id', () async {
    final repository = DioBranchServiceRepository(
      clientReturning({
        'id': 's1',
        'serviceable_id': 'brand-1',
        'name': 'Cut',
        'is_active': false,
      }),
    );

    final updated = await repository.updateService(
      's1',
      brandId: 'brand-1',
      name: {'en': 'Cut', 'ar': 'قص'},
      price: 10,
      currencyCode: 'USD',
      durationMinutes: 20,
      isActive: false,
    );
    expect(captured.method, 'PUT');
    expect(captured.path, '/branch/services/s1');
    expect(updated.isActive, isFalse);

    await repository.deleteService('s1');
    expect(captured.method, 'DELETE');
    expect(captured.path, '/branch/services/s1');
  });

  test('lists the branch staff with their activation status', () async {
    final repository = DioBranchStaffRepository(
      clientReturning(
        [
          {'id': 'a', 'name': 'Karim', 'status': 'enabled'},
          {'id': 'b', 'name': 'Sami', 'status': 'disabled'},
          {'id': 'c', 'name': 'Odd', 'status': 'something-new'},
        ],
        meta: {'current_page': 1, 'last_page': 1, 'per_page': 20, 'total': 3},
      ),
    );

    final page = await repository.getStaff();

    expect(captured.method, 'GET');
    expect(captured.path, BranchEndpoints.managedBarbers);
    expect(page.data.map((member) => member.isActive), [true, false, false]);
  });

  test('reads branch and barber earnings from their own routes', () async {
    final body = {
      'scope': 'branch',
      'totals': [
        {
          'currency_code': 'USD',
          'gross_minor': 10000,
          'commission_minor': 1000,
          'net_minor': 9000,
          'completed_bookings_count': 4,
        },
      ],
    };

    final branch = await DioEarningsRepository.branch(
      clientReturning(body),
    ).getEarnings(from: DateTime(2026, 11, 1), to: DateTime(2026, 11, 30));
    expect(captured.path, BranchEndpoints.earnings);
    expect(captured.queryParameters, {
      'from': '2026-11-01',
      'to': '2026-11-30',
    });
    expect(branch.totals.single.netMinor, 9000);

    await DioEarningsRepository.barber(clientReturning(body)).getEarnings();
    expect(captured.path, OperationsEndpoints.barberEarnings);
    expect(captured.queryParameters, isEmpty);
  });

  test('requests the barber history with its filters', () async {
    final repository = DioStylistAppointmentRepository(
      clientReturning(
        <Object>[],
        meta: {'current_page': 1, 'last_page': 1, 'per_page': 15, 'total': 0},
      ),
    );

    await repository.getAppointments(
      status: BookingStatus.completed,
      from: DateTime(2026, 10, 1),
      page: 2,
    );

    expect(captured.path, OperationsEndpoints.barberAppointments);
    expect(captured.queryParameters, {
      'page': 2,
      'per_page': 15,
      'status': 'completed',
      'from': '2026-10-01',
    });
  });
}
