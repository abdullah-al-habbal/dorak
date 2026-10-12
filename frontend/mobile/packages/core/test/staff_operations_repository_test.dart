import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  test(
    'branch profile uses the authenticated branch profile endpoint',
    () async {
      RequestOptions? captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: {
                'id': 12,
                'name': 'Central Branch',
                'email': 'branch@example.com',
                'status': 'active',
                'latitude': 0,
                'longitude': 0,
                'brand_id': 2,
              },
            ),
          );
        },
      );

      final profile = await DioBranchOperationsRepository(
        clientWith(fake),
      ).getProfile();

      expect(captured!.path, '/branch/profile');
      expect(profile.name, 'Central Branch');
    },
  );

  test(
    'chair status mutation uses the branch chair endpoint and status',
    () async {
      RequestOptions? captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: {'id': 'chair-1', 'label': 'A', 'status': 'maintenance'},
            ),
          );
        },
      );

      final chair = await DioBranchOperationsRepository(
        clientWith(fake),
      ).updateChairStatus('chair-1', 'maintenance');

      expect(captured!.method, 'PATCH');
      expect(captured!.path, '/branch/chairs/chair-1/status');
      expect(captured!.data, {'status': 'maintenance'});
      expect(chair.status, 'maintenance');
    },
  );
}
