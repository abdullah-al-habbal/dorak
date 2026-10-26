import 'package:core/core.dart';
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
      expect(preference.preferredUniverse, 'men');
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
              'filter_config': {
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
    expect(filter.filterConfig['price_range'], {'min': 10, 'max': 50});
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
              'filter_config': {
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
      filterConfig: {
        'price_range': {'min': 5, 'max': 20},
      },
    );

    expect(paths, [ClientInteractionEndpoints.savedFilter('filter-1')]);
    expect(bodies, [
      {
        'name': 'Updated',
        'filter_config': {
          'price_range': {'min': 5, 'max': 20},
        },
      },
    ]);
    expect(filter.name, 'Updated');
  });
}
