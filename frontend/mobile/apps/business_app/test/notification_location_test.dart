import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:business_app/src/core/navigation/notification_location.entity.dart';

void main() {
  NotificationTarget target(String type, [Map<String, dynamic>? data]) =>
      NotificationTarget.fromPayload(type: type, data: data ?? const {});

  test('invite and application notifications land on the app landing', () {
    expect(
      NotificationLocation.of(target('invite')),
      NotificationLocation.landing,
    );
    expect(
      NotificationLocation.of(target('application')),
      NotificationLocation.landing,
    );
  });

  test('booking updates land on the app landing', () {
    expect(
      NotificationLocation.of(target('booking_update', {'booking_id': 'b-1'})),
      NotificationLocation.landing,
    );
  });

  test('review requests and unknown types are not opened in this app', () {
    expect(
      NotificationLocation.of(target('review_request', {'booking_id': 'b-1'})),
      isNull,
    );
    expect(NotificationLocation.of(target('mystery')), isNull);
  });
}
