import 'package:business_app/src/features/operations/booking_status_transitions.entity.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('exposes only legal targets for each booking status', () {
    expect(BookingStatusTransitions.from('pending'), ['confirmed', 'canceled']);
    expect(BookingStatusTransitions.from('confirmed'), [
      'in_progress',
      'canceled',
      'no_show',
    ]);
    expect(BookingStatusTransitions.from('in_progress'), [
      'completed',
      'canceled',
      'no_show',
    ]);
    expect(BookingStatusTransitions.from('completed'), isEmpty);
    expect(BookingStatusTransitions.from('canceled'), isEmpty);
    expect(BookingStatusTransitions.from('no_show'), isEmpty);
  });
}
