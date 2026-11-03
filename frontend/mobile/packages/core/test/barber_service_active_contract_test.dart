import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

const _serviceId = 'service-1';
const _serviceName = {'en': 'Haircut', 'ar': 'قص شعر'};
const _price = 12.5;
const _currency = 'USD';

Map<String, dynamic> _serviceJson({required bool isActive}) => {
  'id': _serviceId,
  'name': 'Haircut',
  'price_amount_minor': 1250,
  'currency_code': _currency,
  'is_at_home': false,
  'is_active': isActive,
};

void main() {
  late List<RequestOptions> requests;
  late bool responseIsActive;
  late DioStylistOperationsRepository repository;

  setUp(() {
    requests = [];
    responseIsActive = true;
    final fake = fakeDio(
      handler: (options) {
        requests.add(options);
        final item = _serviceJson(isActive: responseIsActive);
        final data = options.method == 'GET' ? [item] : item;
        return jsonResponse(options, data: successEnvelope(data: data));
      },
    );
    repository = DioStylistOperationsRepository(clientWith(fake));
  });

  group('BarberServiceDto', () {
    test('reads is_active=false from the backend resource', () {
      final dto = BarberServiceDto.fromJson(_serviceJson(isActive: false));

      expect(dto.active, isFalse);
    });

    test('reads is_active=true from the backend resource', () {
      final dto = BarberServiceDto.fromJson(_serviceJson(isActive: true));

      expect(dto.active, isTrue);
    });

    test('defaults to active when the key is absent', () {
      final dto = BarberServiceDto.fromJson({'id': _serviceId, 'name': 'Cut'});

      expect(dto.active, isTrue);
    });

    test('ignores the legacy active key', () {
      final dto = BarberServiceDto.fromJson({
        ..._serviceJson(isActive: false),
        'active': true,
      });

      expect(dto.active, isFalse);
    });
  });

  group('DioStylistOperationsRepository services', () {
    test('getServices surfaces an inactive service', () async {
      responseIsActive = false;

      final services = await repository.getServices();

      expect(services.single.active, isFalse);
    });

    test('createService sends is_active and not active', () async {
      await repository.createService(
        name: _serviceName,
        price: _price,
        currencyCode: _currency,
        active: false,
      );

      final body = requests.single.data as Map<String, dynamic>;
      expect(body['is_active'], isFalse);
      expect(body.containsKey('active'), isFalse);
    });

    test('updateService sends is_active and not active', () async {
      await repository.updateService(
        _serviceId,
        name: _serviceName,
        price: _price,
        currencyCode: _currency,
        active: false,
      );

      final body = requests.single.data as Map<String, dynamic>;
      expect(requests.single.method, 'PUT');
      expect(body['is_active'], isFalse);
      expect(body.containsKey('active'), isFalse);
    });
  });
}
