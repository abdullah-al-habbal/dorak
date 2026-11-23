import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, Object?> bookingJson(String status) => {
  'id': 'booking-1',
  'starts_at': '2026-09-10T14:30:00.000Z',
  'booking_status': status,
  'chair': {'id': 'chair-1', 'label': 'Chair A', 'status': 'available'},
  'barber': {'id': 'barber-1', 'name': 'Karim'},
  'services': [
    {'id': 'service-1', 'name': 'Fade', 'price_amount_minor': 8000},
  ],
  'created_at': '2026-09-02T10:00:00.000Z',
};

void main() {
  group('BookingStatus', () {
    test('every known wire value round-trips', () {
      for (final status in BookingStatus.values) {
        if (status == BookingStatus.unknown) continue;
        expect(BookingStatus.fromValue(status.value), status);
      }
    });

    test('fromValue falls back to unknown instead of throwing', () {
      expect(BookingStatus.fromValue('rescheduled'), BookingStatus.unknown);
    });

    test('BookingDto keeps decoding when the status is new to this app', () {
      final dto = BookingDto.fromJson(bookingJson('rescheduled'));
      expect(dto.status, BookingStatus.unknown);
    });

    test('BookingDto still decodes a known status', () {
      final dto = BookingDto.fromJson(bookingJson('no_show'));
      expect(dto.status, BookingStatus.noShow);
    });
  });
}
