import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  test('posts the branch manager manual-barber contract', () async {
    late RequestOptions captured;
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return jsonResponse(
          options,
          statusCode: 201,
          data: successEnvelope(
            statusCode: 201,
            data: {
              'id': 'barber-1',
              'name': {'en': 'Karim', 'ar': 'كريم'},
              'phone': '+963944123456',
              'has_login': false,
            },
          ),
        );
      },
    );
    final repository = DioManagedBarberRepository(clientWith(fake));

    final barber = await repository.createManualBarber(
      nameEn: 'Karim',
      nameAr: 'كريم',
      phone: '+963944123456',
    );

    expect(captured.path, BranchEndpoints.managedBarbers);
    expect(captured.data, {
      'name': {'en': 'Karim', 'ar': 'كريم'},
      'phone': '+963944123456',
    });
    expect(barber.hasLogin, isFalse);
  });

  test('activates a barber through the branch endpoint', () async {
    late RequestOptions captured;
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return jsonResponse(
          options,
          statusCode: 201,
          data: successEnvelope(
            statusCode: 201,
            data: {
              'id': 'log-1',
              'activable_id': 'barber-1',
              'activable_type': 'barber',
              'status': 'enabled',
              'reason': null,
            },
          ),
        );
      },
    );
    final repository = DioManagedBarberRepository(clientWith(fake));

    final log = await repository.activateBarber('barber-1');

    expect(
      captured.path,
      BranchEndpoints.activateBarber.replaceFirst('{barber}', 'barber-1'),
    );
    expect(log.status, 'enabled');
  });

  test('deactivates a barber through the branch endpoint', () async {
    late RequestOptions captured;
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return jsonResponse(
          options,
          statusCode: 201,
          data: successEnvelope(
            statusCode: 201,
            data: {
              'id': 'log-1',
              'activable_id': 'barber-1',
              'activable_type': 'barber',
              'status': 'disabled',
              'reason': null,
            },
          ),
        );
      },
    );
    final repository = DioManagedBarberRepository(clientWith(fake));

    final log = await repository.deactivateBarber('barber-1');

    expect(
      captured.path,
      BranchEndpoints.deactivateBarber.replaceFirst('{barber}', 'barber-1'),
    );
    expect(log.status, 'disabled');
  });
}
