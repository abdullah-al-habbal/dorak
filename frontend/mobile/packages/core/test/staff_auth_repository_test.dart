import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  for (final (guard, routes) in [
    ('branch', StaffAuthRoutes.branch()),
    ('barber', StaffAuthRoutes.barber()),
  ]) {
    group('$guard staff auth', () {
      late RequestOptions captured;
      late DioStaffAuthRepository repository;

      setUp(() {
        final fake = fakeDio(
          handler: (options) {
            captured = options;
            return jsonResponse(
              options,
              data: successEnvelope(data: {'token': '7|staff-token'}),
            );
          },
        );
        repository = DioStaffAuthRepository(clientWith(fake), routes);
      });

      test('login posts credentials and returns the token', () async {
        final token = await repository.login(
          email: 'staff@example.com',
          password: 'secret123',
        );

        expect(captured.path, '/$guard/login');
        expect(captured.data, {
          'email': 'staff@example.com',
          'password': 'secret123',
        });
        expect(token, '7|staff-token');
      });

      test('logout posts to the guard logout route', () async {
        await repository.logout();

        expect(captured.method, 'POST');
        expect(captured.path, '/$guard/logout');
      });

      test('refreshToken returns the replacement token', () async {
        final token = await repository.refreshToken();

        expect(captured.path, '/$guard/refresh-token');
        expect(token, '7|staff-token');
      });

      test('forgotPassword posts only the email', () async {
        await repository.forgotPassword('staff@example.com');

        expect(captured.path, '/$guard/forgot-password');
        expect(captured.data, {'email': 'staff@example.com'});
      });

      test('resetPassword posts the code and confirmed password', () async {
        await repository.resetPassword(
          email: 'staff@example.com',
          code: '123456',
          password: 'new-password-2',
          passwordConfirmation: 'new-password-2',
        );

        expect(captured.path, '/$guard/reset-password');
        expect(captured.data, {
          'email': 'staff@example.com',
          'code': '123456',
          'password': 'new-password-2',
          'password_confirmation': 'new-password-2',
        });
      });
    });
  }
}
