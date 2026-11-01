import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('BarberServiceDto parses a populated display_price', () {
    final service = BarberServiceDto.fromJson({
      'id': 'svc-1',
      'name': 'Haircut',
      'price_amount_minor': 10000,
      'currency_code': 'cur-1',
      'display_price': {'amount_minor': 9000, 'currency_code': 'EUR'},
      'conversion_unavailable': false,
      'is_dual_price_display_enabled': true,
    });

    expect(service.displayPrice?.amountMinor, 9000);
    expect(service.displayPrice?.currencyCode, 'EUR');
    expect(service.conversionUnavailable, isFalse);
    expect(service.isDualPriceDisplayEnabled, isTrue);
  });

  test(
    'BarberServiceDto defaults conversion flags to false when the fields are absent',
    () {
      final service = BarberServiceDto.fromJson({
        'id': 'svc-1',
        'name': 'Haircut',
        'price_amount_minor': 10000,
        'currency_code': 'cur-1',
      });

      expect(service.displayPrice, isNull);
      expect(service.conversionUnavailable, isFalse);
      expect(service.isDualPriceDisplayEnabled, isFalse);
    },
  );

  test('BarberServiceDto parses a missing-rate fallback', () {
    final service = BarberServiceDto.fromJson({
      'id': 'svc-1',
      'name': 'Haircut',
      'price_amount_minor': 10000,
      'currency_code': 'cur-1',
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
      'price_amount_minor': 10000,
      'owner': 'brand',
      'display_price': {'amount_minor': 9000, 'currency_code': 'EUR'},
      'is_dual_price_display_enabled': false,
    });

    expect(service.displayPrice?.amountMinor, 9000);
    expect(service.displayPrice?.currencyCode, 'EUR');
    expect(service.isDualPriceDisplayEnabled, isFalse);
  });
}
