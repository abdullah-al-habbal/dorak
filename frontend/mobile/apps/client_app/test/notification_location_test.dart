import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/core/navigation/app_routes.entity.dart';
import 'package:client_app/src/core/navigation/notification_location.entity.dart';

void main() {
  NotificationTarget target(String type, [Map<String, dynamic>? data]) =>
      NotificationTarget.fromPayload(type: type, data: data ?? const {});

  test('review_request maps to the review route for its booking', () {
    expect(
      NotificationLocation.of(
        target('review_request', {'booking_id': 'booking-3'}),
      ),
      AppRoutes.reviewDetail('booking-3'),
    );
  });

  test('booking updates map to the bookings list', () {
    expect(
      NotificationLocation.of(target('booking_update', {'booking_id': 'b'})),
      AppRoutes.bookings,
    );
  });

  test('staff-side and unknown types have no client location', () {
    expect(NotificationLocation.of(target('invite')), isNull);
    expect(NotificationLocation.of(target('application')), isNull);
    expect(NotificationLocation.of(target('mystery')), isNull);
  });
}
