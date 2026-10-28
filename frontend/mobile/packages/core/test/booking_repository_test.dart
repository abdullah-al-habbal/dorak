import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

Map<String, Object?> booking({
  String id = 'booking-1',
  String status = 'confirmed',
}) => {
  'id': id,
  'time_slot': '2026-09-10T14:30:00.000Z',
  'ends_at': '2026-09-10T15:00:00.000Z',
  'status': status,
  'payment_method': 'pay_at_salon',
  'payment_status': 'unpaid_in_person',
  'chair': {'id': 'chair-1', 'label': 'Chair A', 'status': 'available'},
  'barber': {'id': 'barber-1', 'name': 'Karim'},
  'services': [
    {'id': 'service-1', 'name': 'Fade', 'price': 80.0},
  ],
  'created_at': '2026-09-02T10:00:00.000Z',
};

void main() {
  group('DioBookingRepository', () {
    test('getBookings parses items with nested relations', () async {
      final fake = fakeDio(
        handler: (options) => jsonResponse(
          options,
          data: successEnvelope(
            data: [booking()],
            meta: {
              'pagination': {
                'total': 1,
                'count': 1,
                'per_page': 20,
                'current_page': 1,
                'total_pages': 1,
              },
            },
          ),
        ),
      );
      final repository = DioBookingRepository(clientWith(fake));

      final page = await repository.getBookings(status: 'upcoming');

      expect(page.data, hasLength(1));
      final item = page.data.first;
      expect(item.id, 'booking-1');
      expect(item.status, BookingStatus.confirmed);
      expect(item.paymentMethod, 'pay_at_salon');
      expect(item.paymentStatus, 'unpaid_in_person');
      expect(item.timeSlot, DateTime.parse('2026-09-10T14:30:00.000Z'));
      expect(item.endsAt, DateTime.parse('2026-09-10T15:00:00.000Z'));
      expect(item.chair?.label, 'Chair A');
      expect(item.barber?.name, 'Karim');
      expect(item.services.map((service) => service.name), ['Fade']);
      expect(fake.callCount, 1);
    });

    test('getBookings sends the status filter and pagination', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(options, data: successEnvelope(data: const []));
        },
      );
      final repository = DioBookingRepository(clientWith(fake));

      await repository.getBookings(status: 'past', page: 2);

      expect(captured.path, BookingEndpoints.bookings);
      expect(captured.queryParameters['status'], 'past');
      expect(captured.queryParameters['page'], 2);
      expect(captured.queryParameters['per_page'], 20);
    });

    test('getBookings omits the status filter when unset', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(options, data: successEnvelope(data: const []));
        },
      );
      final repository = DioBookingRepository(clientWith(fake));

      await repository.getBookings();

      expect(captured.queryParameters.containsKey('status'), isFalse);
    });

    test('createBooking posts the slot in server format', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            statusCode: 201,
            data: successEnvelope(
              statusCode: 201,
              code: 'CREATED',
              data: booking(),
            ),
          );
        },
      );
      final repository = DioBookingRepository(clientWith(fake));

      final created = await repository.createBooking(
        chairId: 'chair-1',
        barberId: 'barber-1',
        timeSlot: DateTime.utc(2026, 9, 10, 14, 30),
        serviceIds: const ['service-1'],
      );

      expect(captured.path, BookingEndpoints.bookings);
      expect(captured.method, 'POST');
      expect(captured.data, {
        'chair_id': 'chair-1',
        'barber_id': 'barber-1',
        'time_slot': '2026-09-10T14:30:00.000Z',
        'service_ids': ['service-1'],
      });
      expect(created.id, 'booking-1');
    });

    test('createBooking posts a barber-only booking with a branch', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            statusCode: 201,
            data: successEnvelope(
              statusCode: 201,
              code: 'CREATED',
              data: {...booking(), 'chair': null},
            ),
          );
        },
      );
      final repository = DioBookingRepository(clientWith(fake));

      final created = await repository.createBooking(
        branchId: 'branch-1',
        barberId: 'barber-1',
        timeSlot: DateTime.utc(2026, 9, 10, 14, 30),
        serviceIds: const ['service-1'],
      );

      expect(captured.data, {
        'branch_id': 'branch-1',
        'barber_id': 'barber-1',
        'time_slot': '2026-09-10T14:30:00.000Z',
        'service_ids': ['service-1'],
      });
      expect(created.chair, isNull);
    });

    test('createBooking conflict surfaces the status code', () async {
      final fake = fakeDio(
        handler: (options) => jsonResponse(
          options,
          statusCode: 409,
          data: errorEnvelope(
            code: 'CONFLICT',
            statusCode: 409,
            message: 'booking::messages.chair_not_available',
          ),
        ),
      );
      final repository = DioBookingRepository(clientWith(fake));

      await expectLater(
        repository.createBooking(
          chairId: 'chair-1',
          serviceIds: const ['service-1'],
          timeSlot: DateTime.utc(2026, 9, 10, 14, 30),
        ),
        throwsA(
          isA<ApiException>().having((e) => e.statusCode, 'statusCode', 409),
        ),
      );
    });

    test(
      'createBooking sends a complete at-home address and GPS pin',
      () async {
        late RequestOptions captured;
        final fake = fakeDio(
          handler: (options) {
            captured = options;
            return jsonResponse(
              options,
              statusCode: 201,
              data: successEnvelope(statusCode: 201, data: booking()),
            );
          },
        );
        final repository = DioBookingRepository(clientWith(fake));

        await repository.createBooking(
          timeSlot: DateTime.utc(2026, 9, 10, 14, 30),
          serviceIds: const ['service-1'],
          atHomeStreet: 'Al Hamra Street',
          atHomeBuilding: '12',
          atHomeUnit: '4B',
          atHomeLatitude: 33.8938,
          atHomeLongitude: 35.5018,
        );

        expect(captured.data['at_home_location'], {
          'street': 'Al Hamra Street',
          'building': '12',
          'unit': '4B',
          'latitude': 33.8938,
          'longitude': 35.5018,
        });
        expect(captured.data.containsKey('chair_id'), isFalse);
      },
    );

    test('createBooking rejects an empty service list before any request', () {
      final fake = fakeDio(
        handler: (options) => jsonResponse(options, data: successEnvelope()),
      );
      final repository = DioBookingRepository(clientWith(fake));

      expect(
        () => repository.createBooking(
          chairId: 'chair-1',
          timeSlot: DateTime.utc(2026, 9, 10, 14, 30),
          serviceIds: const [],
        ),
        throwsArgumentError,
      );
      expect(fake.callCount, 0);
    });

    test('createBooking rejects a partial at-home address', () {
      final repository = DioBookingRepository(
        clientWith(
          fakeDio(
            handler: (options) =>
                jsonResponse(options, data: successEnvelope()),
          ),
        ),
      );

      expect(
        () => repository.createBooking(
          timeSlot: DateTime.utc(2026, 9, 10, 14, 30),
          serviceIds: const ['service-1'],
          atHomeLatitude: 33.8938,
        ),
        throwsArgumentError,
      );
    });

    test('cancelBooking posts to the cancel route', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(options, data: successEnvelope());
        },
      );
      final repository = DioBookingRepository(clientWith(fake));

      await repository.cancelBooking('booking-1');

      expect(captured.path, '/client/bookings/booking-1/cancel');
      expect(captured.method, 'POST');
    });

    test('getBarberSlots parses UTC slots and sends date + services', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: [
                {
                  'starts_at': '2026-10-01T12:00:00.000Z',
                  'ends_at': '2026-10-01T12:30:00.000Z',
                },
              ],
            ),
          );
        },
      );
      final repository = DioBookingRepository(clientWith(fake));

      final slots = await repository.getBarberSlots(
        'barber-1',
        date: DateTime.utc(2026, 10, 1),
        serviceIds: const ['service-1'],
      );

      expect(captured.path, '/barbers/barber-1/slots');
      expect(captured.queryParameters['date'], '2026-10-01');
      expect(captured.queryParameters['service_ids'], ['service-1']);
      expect(slots, hasLength(1));
      expect(slots.first.startsAt, DateTime.utc(2026, 10, 1, 12));
      expect(captured.queryParameters.containsKey('at_home'), isFalse);
    });

    test('getBarberSlots sends at_home with coordinates', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(options, data: successEnvelope(data: []));
        },
      );
      final repository = DioBookingRepository(clientWith(fake));

      await repository.getBarberSlots(
        'barber-1',
        date: DateTime.utc(2026, 10, 1),
        serviceIds: const ['service-1'],
        atHomeLatitude: 33.5,
        atHomeLongitude: 36.3,
      );

      expect(captured.queryParameters['at_home'], 1);
      expect(captured.queryParameters['latitude'], 33.5);
      expect(captured.queryParameters['longitude'], 36.3);
    });
  });
}
