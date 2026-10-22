import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('NotificationTarget.fromPayload', () {
    test('maps review_request to the review target with the booking id', () {
      final target = NotificationTarget.fromPayload(
        type: 'review_request',
        data: {'booking_id': 'b-1'},
      );

      expect(target.kind, NotificationTargetKind.review);
      expect(target.bookingId, 'b-1');
    });

    test('maps the FCM data shape for a review request', () {
      final target = NotificationTarget.fromPayload(
        data: {'type': 'review_request', 'booking_id': 'b-1'},
      );

      expect(target.kind, NotificationTargetKind.review);
    });

    test('maps booking updates, statuses and reschedules to booking', () {
      for (final type in [
        'booking_update',
        'booking_status',
        'booking_rescheduled',
      ]) {
        final target = NotificationTarget.fromPayload(
          data: {'type': type, 'booking_id': 'b-2'},
        );
        expect(target.kind, NotificationTargetKind.booking, reason: type);
        expect(target.bookingId, 'b-2');
      }
    });

    test('maps invite and application with their ids', () {
      final invite = NotificationTarget.fromPayload(
        type: 'invite',
        data: {'event': 'affiliation_invited', 'affiliation_id': 'a-1'},
      );
      final application = NotificationTarget.fromPayload(
        data: {'type': 'application', 'application_id': 'p-1'},
      );

      expect(invite.kind, NotificationTargetKind.invite);
      expect(invite.affiliationId, 'a-1');
      expect(application.kind, NotificationTargetKind.application);
      expect(application.applicationId, 'p-1');
    });

    test('never throws and is unknown for unsupported or incomplete data', () {
      expect(
        NotificationTarget.fromPayload(type: 'mystery').kind,
        NotificationTargetKind.unknown,
      );
      expect(
        NotificationTarget.fromPayload(type: 'review_request').kind,
        NotificationTargetKind.unknown,
      );
      expect(
        NotificationTarget.fromPayload(
          type: 'booking_update',
          data: {'booking_id': 7},
        ).kind,
        NotificationTargetKind.unknown,
      );
    });
  });
}
