import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  test('saved filters and discovery preferences use their client endpoints', () async {
    final paths = <String>[];
    final fake = fakeDio(handler: (options) {
      paths.add(options.path);
      final data = options.path == ClientInteractionEndpoints.savedFilters
          ? <Object?>[]
          : {'id': 'pref-1', 'preferred_universe': 'men', 'hidden_brand_ids': []};
      return jsonResponse(options, data: successEnvelope(data: data));
    });
    final repository = DioClientInteractionRepository(clientWith(fake));

    await repository.getSavedFilters();
    final preference = await repository.getDiscoveryPreferences();

    expect(paths, [ClientInteractionEndpoints.savedFilters, ClientInteractionEndpoints.discoveryPreferences]);
    expect(preference.preferredUniverse, 'men');
  });
}
