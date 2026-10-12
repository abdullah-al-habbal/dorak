import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  for (final (endpoint, path) in [
    (BranchAuthEndpoints.login, '/branch/login'),
    (BarberAuthEndpoints.login, '/barber/login'),
  ]) {
    test(
      'staff login posts credentials to $path and returns the token',
      () async {
        RequestOptions? captured;
        final fake = fakeDio(
          handler: (options) {
            captured = options;
            return jsonResponse(
              options,
              data: successEnvelope(data: {'token': '7|staff-token'}),
            );
          },
        );
        final repository = DioStaffAuthRepository(clientWith(fake), endpoint);

        final token = await repository.login(
          email: 'staff@example.com',
          password: 'secret123',
        );

        expect(captured!.path, path);
        expect(captured!.data, {
          'email': 'staff@example.com',
          'password': 'secret123',
        });
        expect(token, '7|staff-token');
      },
    );
  }
}
