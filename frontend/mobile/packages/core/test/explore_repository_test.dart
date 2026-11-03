import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  group('DioExploreRepository', () {
    test('sends universe, coordinates, radius and per_page', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(options, data: successEnvelope(data: const []));
        },
      );
      final client = clientWith(fake);
      final repository = DioExploreRepository(client);

      await repository.searchPayload(
        latitude: 24.7136,
        longitude: 46.6753,
        radius: 10,
        universe: 'women',
        page: 2,
        perPage: 15,
      );

      expect(captured.path, ExploreEndpoints.search);
      expect(captured.queryParameters['latitude'], 24.7136);
      expect(captured.queryParameters['longitude'], 46.6753);
      expect(captured.queryParameters['radius'], 10);
      expect(captured.queryParameters['universe'], 'women');
      expect(captured.queryParameters['page'], 2);
      expect(captured.queryParameters['per_page'], 15);
    });

    test('getBranchDetail parses detail with barbers and services', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: {
                'id': '1',
                'name': 'Branch 1',
                'email': 'branch1@example.com',
                'status': 'enabled',
                'latitude': 24.7136,
                'longitude': 46.6753,
                'brand_id': '7',
                'chairs_count': 2,
                'barbers': [
                  {'id': 'barber-1', 'name': 'Karim'},
                ],
                'services': [
                  {
                    'id': 'service-1',
                    'name': 'Fade',
                    'price_amount_minor': 8000,
                  },
                ],
              },
            ),
          );
        },
      );
      final repository = DioExploreRepository(clientWith(fake));

      final detail = await repository.getBranchDetail('1');

      expect(captured.path, '/explore/branches/1');
      expect(detail.name, 'Branch 1');
      expect(detail.chairsCount, 2);
      expect(detail.barbers.map((barber) => barber.name), ['Karim']);
      expect(detail.services.map((service) => service.priceAmountMinor), [
        8000,
      ]);
    });

    test('getBarberServices lists the barber services', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: [
                {'id': 'service-1', 'name': 'Fade', 'price_amount_minor': 8000},
              ],
            ),
          );
        },
      );
      final repository = DioExploreRepository(clientWith(fake));

      final services = await repository.getBarberServices('barber-1');

      expect(captured.path, '/barbers/barber-1/services');
      expect(services.single.id, 'service-1');
    });

    test('getBarberDetail parses profile with services', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: {
                'id': 'barber-1',
                'name': 'Karim',
                'email': 'karim@example.com',
                'is_freelancer': true,
                'status': 'enabled',
                'travel_radius_km': 15.0,
                'latitude': 24.7136,
                'longitude': 46.6753,
                'distance': 2.1,
                'compatibility_score': 0.88,
                'rank': 3,
                'created_at': '2026-01-15T10:00:00.000Z',
                'services': [
                  {
                    'id': 'service-1',
                    'name': 'Fade',
                    'description': 'A clean fade.',
                    'price_amount_minor': 8000,
                    'currency_code': 'SAR',
                    'duration_minutes': 45,
                    'is_at_home': true,
                    'active': true,
                    'created_at': '2026-01-15T10:00:00.000Z',
                  },
                ],
              },
            ),
          );
        },
      );
      final repository = DioExploreRepository(clientWith(fake));

      final detail = await repository.getBarberDetail('barber-1');

      expect(captured.path, '/explore/barbers/barber-1');
      expect(detail.name, 'Karim');
      expect(detail.email, 'karim@example.com');
      expect(detail.isFreelancer, isTrue);
      expect(detail.status, BarberStatus.enabled);
      expect(detail.travelRadiusKm, 15.0);
      expect(detail.latitude, 24.7136);
      expect(detail.longitude, 46.6753);
      expect(detail.distance, 2.1);
      expect(detail.compatibilityScore, 0.88);
      expect(detail.rank, 3);
      expect(detail.createdAt, isNotNull);
      final service = detail.services.single;
      expect(service.id, 'service-1');
      expect(service.name, 'Fade');
      expect(service.priceAmountMinor, 8000);
      expect(service.currencyCode, 'SAR');
      expect(service.durationMinutes, 45);
      expect(service.isAtHome, isTrue);
      expect(service.active, isTrue);
      expect(service.createdAt, isNotNull);
    });

    test('sends a trimmed q only when the search text is not blank', () async {
      final captured = <Map<String, dynamic>>[];
      final fake = fakeDio(
        handler: (options) {
          captured.add(Map.of(options.queryParameters));
          return jsonResponse(
            options,
            data: successEnvelope(
              data: <dynamic>[],
              meta: {
                'pagination': {
                  'total': 0,
                  'count': 0,
                  'per_page': 20,
                  'current_page': 1,
                  'total_pages': 1,
                },
              },
            ),
          );
        },
      );
      final repository = DioExploreRepository(clientWith(fake));

      await repository.searchPayload(
        latitude: 1,
        longitude: 2,
        radius: 3,
        universe: 'men',
        query: '  royal ',
      );
      await repository.searchPayload(
        latitude: 1,
        longitude: 2,
        radius: 3,
        universe: 'men',
        query: '   ',
      );

      expect(captured.first['q'], 'royal');
      expect(captured.last.containsKey('q'), isFalse);
    });
  });
}
