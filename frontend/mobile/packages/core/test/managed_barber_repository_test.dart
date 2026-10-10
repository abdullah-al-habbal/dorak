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
}
