import 'package:business_app/src/features/operations/booking_status_transitions.entity.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('exposes only legal targets for each booking status', () {
    expect(BookingStatusTransitions.from(BookingStatus.pending), [
      BookingStatus.confirmed,
      BookingStatus.canceled,
    ]);
    expect(BookingStatusTransitions.from(BookingStatus.confirmed), [
      BookingStatus.inProgress,
      BookingStatus.canceled,
      BookingStatus.noShow,
    ]);
    expect(BookingStatusTransitions.from(BookingStatus.inProgress), [
      BookingStatus.completed,
      BookingStatus.canceled,
      BookingStatus.noShow,
    ]);
    expect(BookingStatusTransitions.from(BookingStatus.completed), isEmpty);
    expect(BookingStatusTransitions.from(BookingStatus.canceled), isEmpty);
    expect(BookingStatusTransitions.from(BookingStatus.noShow), isEmpty);
  });
}
