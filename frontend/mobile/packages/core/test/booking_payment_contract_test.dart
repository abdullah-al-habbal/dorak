import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

/// Task 65: payment gateways are admin data and bookings stay pay-at-salon, so
/// the booking payload the apps parse must not change shape.
void main() {
  Map<String, dynamic> bookingJson(Map<String, dynamic> extra) => {
    'id': 'b1',
    'time_slot': '2026-11-01T10:00:00Z',
    'status': 'completed',
    ...extra,
  };

  test('parses the pay-at-salon payment fields', () {
    final booking = BookingDto.fromJson(
      bookingJson({
        'payment_method': 'pay_at_salon',
        'payment_status': 'unpaid_in_person',
      }),
    );

    expect(booking.paymentMethod, 'pay_at_salon');
    expect(booking.paymentStatus, 'unpaid_in_person');
  });

  test('falls back to pay-at-salon when the payment fields are absent', () {
    final booking = BookingDto.fromJson(bookingJson({}));

    expect(booking.paymentMethod, 'pay_at_salon');
    expect(booking.paymentStatus, 'unpaid_in_person');
  });

  test('keeps an unknown payment method as a plain string', () {
    final booking = BookingDto.fromJson(
      bookingJson({
        'payment_method': 'syriatel_cash',
        'payment_status': 'paid',
      }),
    );

    expect(booking.paymentMethod, 'syriatel_cash');
    expect(booking.paymentStatus, 'paid');
  });
}
