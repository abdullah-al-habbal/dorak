import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  test('getBrands pages the public brand list and parses names', () async {
    String? path;
    Map<String, dynamic>? query;
    final fake = fakeDio(
      handler: (options) {
        path = options.path;
        query = options.queryParameters;
        return jsonResponse(
          options,
          data: successEnvelope(
            data: [
              {
                'id': 'brand-1',
                'name': {'en': 'Fade Lab', 'ar': 'فيد لاب'},
                'logo_url': null,
                'slug': 'fade-lab',
              },
            ],
            meta: {
              'total': 1,
              'count': 1,
              'per_page': 100,
              'current_page': 1,
              'total_pages': 1,
            },
          ),
        );
      },
    );
    final repository = DioBrandRepository(clientWith(fake));

    final page = await repository.getBrands();

    expect(path, BrandEndpoints.brands);
    expect(query, {'page': 1, 'per_page': 100});
    expect(page.data.single.id, 'brand-1');
    expect(page.data.single.name['ar'], 'فيد لاب');
    expect(page.meta.totalPages, 1);
  });
}
