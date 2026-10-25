import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('BarberServiceDto parses a populated display_price', () {
    final service = BarberServiceDto.fromJson({
      'id': 'svc-1',
      'name': 'Haircut',
      'price': 100,
      'currency_id': 'cur-1',
      'display_price': {'amount': 90.0, 'currency_code': 'EUR'},
      'conversion_unavailable': false,
      'dual_price_display': true,
    });

    expect(service.displayPrice?.amount, 90.0);
    expect(service.displayPrice?.currencyCode, 'EUR');
    expect(service.conversionUnavailable, isFalse);
    expect(service.dualPriceDisplay, isTrue);
  });

  test(
    'BarberServiceDto defaults conversion flags to false when the fields are absent',
    () {
      final service = BarberServiceDto.fromJson({
        'id': 'svc-1',
        'name': 'Haircut',
        'price': 100,
        'currency_id': 'cur-1',
      });

      expect(service.displayPrice, isNull);
      expect(service.conversionUnavailable, isFalse);
      expect(service.dualPriceDisplay, isFalse);
    },
  );

  test('BarberServiceDto parses a missing-rate fallback', () {
    final service = BarberServiceDto.fromJson({
      'id': 'svc-1',
      'name': 'Haircut',
      'price': 100,
      'currency_id': 'cur-1',
      'display_price': null,
      'conversion_unavailable': true,
    });

    expect(service.displayPrice, isNull);
    expect(service.conversionUnavailable, isTrue);
  });

  test('BookingServiceDto parses a populated display_price', () {
    final service = BookingServiceDto.fromJson({
      'id': 'svc-1',
      'name': 'Haircut',
      'price': 100,
      'owner': 'brand',
      'display_price': {'amount': 90.0, 'currency_code': 'EUR'},
      'dual_price_display': false,
    });

    expect(service.displayPrice?.amount, 90.0);
    expect(service.displayPrice?.currencyCode, 'EUR');
    expect(service.dualPriceDisplay, isFalse);
  });
}
