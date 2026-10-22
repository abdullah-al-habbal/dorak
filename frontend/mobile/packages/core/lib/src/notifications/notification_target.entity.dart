enum NotificationTargetKind { review, booking, invite, application, unknown }

/// Where a notification should take the user, resolved from its `type` and
/// ID-only `data` payload. Accepts both the inbox shape (`type` is the
/// notification type) and the FCM data shape (`data.type` and `data.event`).
class NotificationTarget {
  const NotificationTarget(
    this.kind, {
    this.bookingId,
    this.affiliationId,
    this.applicationId,
  });

  const NotificationTarget.unknown() : this(NotificationTargetKind.unknown);

  factory NotificationTarget.fromPayload({
    String? type,
    Map<String, dynamic> data = const {},
  }) {
    final bookingId = _id(data['booking_id']);
    final affiliationId = _id(data['affiliation_id']);
    final applicationId = _id(data['application_id']);
    final kind = _kindOf([type, data['type'], data['event']]);
    final needsBooking =
        kind == NotificationTargetKind.review ||
        kind == NotificationTargetKind.booking;
    if (needsBooking && bookingId == null) {
      return const NotificationTarget.unknown();
    }
    return NotificationTarget(
      kind,
      bookingId: bookingId,
      affiliationId: affiliationId,
      applicationId: applicationId,
    );
  }

  final NotificationTargetKind kind;
  final String? bookingId;
  final String? affiliationId;
  final String? applicationId;

  static String? _id(Object? value) {
    if (value is! String || value.isEmpty) return null;
    return value;
  }

  static NotificationTargetKind _kindOf(List<Object?> candidates) {
    for (final candidate in candidates) {
      final kind = switch (candidate) {
        'review_request' => NotificationTargetKind.review,
        'booking_update' ||
        'booking_status' ||
        'booking_rescheduled' => NotificationTargetKind.booking,
        'invite' ||
        'affiliation_invited' ||
        'affiliation_responded' => NotificationTargetKind.invite,
        'application' ||
        'application_received' ||
        'application_status_changed' => NotificationTargetKind.application,
        _ => null,
      };
      if (kind != null) return kind;
    }
    return NotificationTargetKind.unknown;
  }
}
