import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  test(
    'saved filters and discovery preferences use their client endpoints',
    () async {
      final paths = <String>[];
      final fake = fakeDio(
        handler: (options) {
          paths.add(options.path);
          final data = options.path == ClientInteractionEndpoints.savedFilters
              ? <Object?>[]
              : {
                  'id': 'pref-1',
                  'preferred_universe': 'men',
                  'hidden_brand_ids': [],
                };
          return jsonResponse(options, data: successEnvelope(data: data));
        },
      );
      final repository = DioClientInteractionRepository(clientWith(fake));

      await repository.getSavedFilters();
      final preference = await repository.getDiscoveryPreferences();

      expect(paths, [
        ClientInteractionEndpoints.savedFilters,
        ClientInteractionEndpoints.discoveryPreferences,
      ]);
      expect(preference.preferredUniverse, ClientUniverse.men);
    },
  );

  test('getSavedFilter reads one filter by id', () async {
    final fake = fakeDio(
      handler: (options) {
        return jsonResponse(
          options,
          data: successEnvelope(
            data: {
              'id': 'filter-1',
              'name': 'Nearby cheap',
              'filter_criteria': {
                'price_range': {'min': 10, 'max': 50},
              },
            },
          ),
        );
      },
    );
    final repository = DioClientInteractionRepository(clientWith(fake));

    final filter = await repository.getSavedFilter('filter-1');

    expect(filter.id, 'filter-1');
    expect(filter.filterCriteria['price_range'], {'min': 10, 'max': 50});
  });

  test('updateSavedFilter PUTs the filter by id with the new values', () async {
    final paths = <String>[];
    final bodies = <Object?>[];
    final fake = fakeDio(
      handler: (options) {
        paths.add(options.path);
        bodies.add(options.data);
        return jsonResponse(
          options,
          data: successEnvelope(
            data: {
              'id': 'filter-1',
              'name': 'Updated',
              'filter_criteria': {
                'price_range': {'min': 5, 'max': 20},
              },
            },
          ),
        );
      },
    );
    final repository = DioClientInteractionRepository(clientWith(fake));

    final filter = await repository.updateSavedFilter(
      id: 'filter-1',
      name: 'Updated',
      filterCriteria: {
        'price_range': {'min': 5, 'max': 20},
      },
    );

    expect(paths, [ClientInteractionEndpoints.savedFilter('filter-1')]);
    expect(bodies, [
      {
        'name': 'Updated',
        'filter_criteria': {
          'price_range': {'min': 5, 'max': 20},
        },
      },
    ]);
    expect(filter.name, 'Updated');
  });

  test(
    'deleteSavedFilter DELETEs the filter and saveFilter POSTs a new one',
    () async {
      final calls = <String>[];
      final fake = fakeDio(
        handler: (options) {
          calls.add('${options.method} ${options.path}');
          return jsonResponse(
            options,
            data: successEnvelope(
              data: options.method == 'DELETE'
                  ? null
                  : {
                      'id': 'filter-1',
                      'name': 'Close by',
                      'filter_criteria': {'radius': 5},
                    },
            ),
          );
        },
      );
      final repository = DioClientInteractionRepository(clientWith(fake));

      await repository.saveFilter(
        name: 'Close by',
        filterCriteria: {'radius': 5},
      );
      await repository.deleteSavedFilter('filter-1');

      expect(calls, [
        'POST /client/saved-filters',
        'DELETE /client/saved-filters/filter-1',
      ]);
    },
  );

  test('updateDiscoveryPreferences PATCHes the preferences', () async {
    late RequestOptions captured;
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return jsonResponse(
          options,
          data: successEnvelope(
            data: {
              'id': 'pref-1',
              'default_radius_km': 12.0,
              'hidden_brand_ids': [],
            },
          ),
        );
      },
    );
    final repository = DioClientInteractionRepository(clientWith(fake));

    final preference = await repository.updateDiscoveryPreferences({
      'default_radius_km': 12,
    });

    expect(captured.method, 'PATCH');
    expect(captured.path, '/client/discovery-preferences');
    expect(captured.data, {'default_radius_km': 12});
    expect(preference.defaultRadiusKm, 12.0);
  });
}
