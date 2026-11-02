import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  group('DioBranchRepository', () {
    test('getFloorPlan parses chairs with availability', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: {
                'branch_id': 'branch-1',
                'branch_name': 'Branch 1',
                'chairs': [
                  {
                    'id': 'chair-1',
                    'label': 'A',
                    'status': 'available',
                    'barber': {'id': 'barber-1', 'name': 'Karim'},
                  },
                  {'id': 'chair-2', 'label': 'B', 'status': 'occupied'},
                ],
              },
            ),
          );
        },
      );
      final repository = DioBranchRepository(clientWith(fake));

      final plan = await repository.getFloorPlan(
        'branch-1',
        startsAt: DateTime(2026, 10, 1, 15),
        durationMinutes: 30,
      );

      expect(captured.path, '/branches/branch-1/floor-plan');
      expect(captured.queryParameters['starts_at'], '2026-10-01T12:00:00.000Z');
      expect(captured.queryParameters.containsKey('date'), isFalse);
      expect(captured.queryParameters['duration_minutes'], 30);
      expect(plan.branchName, 'Branch 1');
      expect(plan.chairs, hasLength(2));
      expect(plan.chairs.first.status, ChairStatus.available);
      expect(plan.chairs.first.barber?.name, 'Karim');
      expect(plan.chairs.last.status, ChairStatus.occupied);
      expect(fake.callCount, 1);
    });

    test('getBranchSlots parses UTC slots and sends date + services', () async {
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
                {
                  'starts_at': '2026-10-01T12:15:00.000Z',
                  'ends_at': '2026-10-01T12:45:00.000Z',
                },
              ],
            ),
          );
        },
      );
      final repository = DioBranchRepository(clientWith(fake));

      final slots = await repository.getBranchSlots(
        'branch-1',
        date: DateTime.utc(2026, 10, 1),
        serviceIds: const ['service-1', 'service-2'],
        chairId: 'chair-1',
      );

      expect(captured.path, '/branches/branch-1/slots');
      expect(captured.queryParameters['date'], '2026-10-01');
      expect(captured.queryParameters['service_ids'], [
        'service-1',
        'service-2',
      ]);
      expect(captured.queryParameters['chair_id'], 'chair-1');
      expect(captured.queryParameters.containsKey('barber_id'), isFalse);
      expect(slots, hasLength(2));
      expect(slots.first.startsAt, DateTime.utc(2026, 10, 1, 12));
      expect(slots.first.endsAt, DateTime.utc(2026, 10, 1, 12, 30));
    });

    test(
      'floor plan and booking requests encode the same UTC instant',
      () async {
        late RequestOptions floorPlanRequest;
        late RequestOptions bookingRequest;
        final startsAt = DateTime.parse('2026-10-01T18:00:00+03:00');
        final branchApi = clientWith(
          fakeDio(
            handler: (options) {
              floorPlanRequest = options;
              return jsonResponse(
                options,
                data: successEnvelope(
                  data: {
                    'branch_id': 'branch-1',
                    'branch_name': 'Branch 1',
                    'chairs': [],
                  },
                ),
              );
            },
          ),
        );
        final bookingApi = clientWith(
          fakeDio(
            handler: (options) {
              bookingRequest = options;
              return jsonResponse(
                options,
                statusCode: 201,
                data: successEnvelope(
                  statusCode: 201,
                  data: {
                    'id': 'booking-1',
                    'starts_at': '2026-10-01T15:00:00.000Z',
                    'ends_at': '2026-10-01T15:30:00.000Z',
                    'booking_status': 'pending',
                    'payment_method': 'pay_at_salon',
                    'payment_status': 'unpaid_in_person',
                    'services': [],
                    'created_at': '2026-09-30T10:00:00.000Z',
                  },
                ),
              );
            },
          ),
        );

        await DioBranchRepository(
          branchApi,
        ).getFloorPlan('branch-1', startsAt: startsAt, durationMinutes: 30);
        await DioBookingRepository(bookingApi).createBooking(
          chairId: 'chair-1',
          startsAt: startsAt,
          serviceIds: const ['service-1'],
        );

        expect(
          floorPlanRequest.queryParameters['starts_at'],
          bookingRequest.data['starts_at'],
        );
        expect(
          floorPlanRequest.queryParameters['starts_at'],
          '2026-10-01T15:00:00.000Z',
        );
      },
    );
  });
}
