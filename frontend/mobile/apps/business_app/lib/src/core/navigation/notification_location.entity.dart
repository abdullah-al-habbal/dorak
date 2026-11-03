import 'package:core/core.dart';

import 'package:business_app/src/core/navigation/app_routes.entity.dart';

/// Maps a resolved [NotificationTarget] to a location in this app. Invites
/// open the affiliations screen and applications the job postings (the
/// payload carries no job id). Review requests belong to the client app.
class NotificationLocation {
  const NotificationLocation._();

  static const String landing = AppRoutes.operations;

  static String? of(NotificationTarget target) => switch (target.kind) {
    NotificationTargetKind.booking => landing,
    NotificationTargetKind.invite => AppRoutes.affiliations,
    NotificationTargetKind.application => AppRoutes.jobs,
    NotificationTargetKind.review || NotificationTargetKind.unknown => null,
  };
}
