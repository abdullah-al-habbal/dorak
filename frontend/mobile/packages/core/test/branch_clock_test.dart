import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('BranchClock', () {
    test('reads an instant on the branch clock, not the device clock', () {
      final read = BranchClock.read(DateTime.utc(2026, 12, 2, 22, 30), 180);

      expect(
        [read.year, read.month, read.day, read.hour, read.minute],
        [2026, 12, 3, 1, 30],
      );
    });

    test('uses the device zone when the backend sends no offset', () {
      final instant = DateTime.utc(2026, 12, 2, 6);

      expect(BranchClock.read(instant, null), instant.toLocal());
    });

    test('formats a picked date and time from their own fields', () {
      final picked = DateTime(2026, 1, 5, 9, 7);

      expect(BranchClock.calendarDate(picked), '2026-01-05');
      expect(BranchClock.wallClockMinute(picked), '2026-01-05T09:07');
    });
  });

  group('wire times', () {
    const offset = 330;

    test('a slot shows its start on the branch clock', () {
      final slot = SlotDto.fromJson({
        'starts_at': '2026-12-02T03:30:00Z',
        'ends_at': '2026-12-02T04:00:00Z',
        'timezone': 'Asia/Kolkata',
        'utc_offset_minutes': offset,
      });

      expect(slot.startsAtOnBranchClock.hour, 9);
      expect(slot.startsAt, DateTime.utc(2026, 12, 2, 3, 30));
    });

    test('a booking keeps its instants and reads both ends', () {
      final booking = BookingDto.fromJson({
        'id': 'booking-1',
        'starts_at': '2026-12-02T03:30:00+00:00',
        'ends_at': '2026-12-02T04:00:00+00:00',
        'utc_offset_minutes': offset,
        'booking_status': 'pending',
      });

      expect(booking.startsAtOnBranchClock.hour, 9);
      expect(booking.endsAtOnBranchClock?.minute, 30);
      expect(booking.startsAt, DateTime.utc(2026, 12, 2, 3, 30));
    });

    test('a visit shows when it happened on the branch clock', () {
      final visit = ServiceHistoryDto.fromJson({
        'id': 'visit-1',
        'performed_at': '2026-12-02T03:30:00+00:00',
        'utc_offset_minutes': offset,
      });

      expect(visit.performedAtOnBranchClock?.hour, 9);
    });
  });
}
