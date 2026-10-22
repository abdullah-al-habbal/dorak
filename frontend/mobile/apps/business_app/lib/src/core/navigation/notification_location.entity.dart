import 'package:core/core.dart';

/// Maps a resolved [NotificationTarget] to a location in this app. The invite
/// and application screens arrive with their feature tasks, so those
/// notifications land on the app's landing screen until then. Review requests
/// belong to the client app.
class NotificationLocation {
  const NotificationLocation._();

  static const String landing = '/operations';

  static String? of(NotificationTarget target) => switch (target.kind) {
    NotificationTargetKind.booking ||
    NotificationTargetKind.invite ||
    NotificationTargetKind.application => landing,
    NotificationTargetKind.review || NotificationTargetKind.unknown => null,
  };
}
