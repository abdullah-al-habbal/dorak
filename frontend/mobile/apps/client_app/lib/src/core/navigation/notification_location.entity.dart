import 'package:core/core.dart';

import 'package:client_app/src/core/navigation/app_routes.entity.dart';

/// Maps a resolved [NotificationTarget] to a client app location. Booking
/// details need the booking itself, which a notification does not carry, so
/// booking updates open the bookings list instead.
class NotificationLocation {
  const NotificationLocation._();

  static String? of(NotificationTarget target) => switch (target.kind) {
    NotificationTargetKind.review => AppRoutes.reviewDetail(target.bookingId!),
    NotificationTargetKind.booking => AppRoutes.bookings,
    NotificationTargetKind.invite ||
    NotificationTargetKind.application ||
    NotificationTargetKind.unknown => null,
  };
}
