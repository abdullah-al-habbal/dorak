import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  test('register posts the sign-up form and returns the token', () async {
    RequestOptions? captured;
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return jsonResponse(
          options,
          statusCode: 201,
          data: successEnvelope(
            statusCode: 201,
            code: 'CREATED',
            data: {
              'token': '7|pending',
              'barber': {'id': 'b-1', 'status': 'pending'},
            },
          ),
        );
      },
    );

    final token = await DioBarberRegistrationRepository(clientWith(fake))
        .register(
          name: 'Omar',
          email: 'omar@example.com',
          password: 'secret-pass-1',
          passwordConfirmation: 'secret-pass-1',
          isFreelancer: false,
        );

    expect(token, '7|pending');
    expect(captured!.path, '/barber/register');
    expect(captured!.data, {
      'name': 'Omar',
      'email': 'omar@example.com',
      'password': 'secret-pass-1',
      'password_confirmation': 'secret-pass-1',
      'is_freelancer': false,
    });
  });

  test('a taken email surfaces as an email field error', () async {
    final fake = fakeDio(
      handler: (options) => jsonResponse(
        options,
        statusCode: 422,
        data: errorEnvelope(
          code: 'VALIDATION_FAILED',
          statusCode: 422,
          message: 'core::messages.validation_failed',
          errors: {
            'email': ['The email has already been taken.'],
          },
        ),
      ),
    );

    await expectLater(
      DioBarberRegistrationRepository(clientWith(fake)).register(
        name: 'Omar',
        email: 'omar@example.com',
        password: 'secret-pass-1',
        passwordConfirmation: 'secret-pass-1',
        isFreelancer: true,
      ),
      throwsA(
        isA<ValidationException>().having(
          (e) => e.errors.keys,
          'fields',
          contains('email'),
        ),
      ),
    );
  });

  test('email verification posts the code to the barber route', () async {
    final paths = <String>[];
    final payloads = <Object?>[];
    final fake = fakeDio(
      handler: (options) {
        paths.add(options.path);
        payloads.add(options.data);
        return jsonResponse(options, data: successEnvelope());
      },
    );
    final repository = DioBarberRegistrationRepository(clientWith(fake));

    await repository.sendEmailVerification();
    await repository.verifyEmail('123456');

    expect(paths, ['/barber/email/verify/send', '/barber/email/verify']);
    expect(payloads.last, {'code': '123456'});
  });
}
