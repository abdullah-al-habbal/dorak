import 'package:core/src/network/feedback_app.entity.dart';
import 'package:core/src/network/feedback_kind.entity.dart';
import 'package:core/src/network/feedback_related_type.entity.dart';

/// One suggestion, bug report or support request. Source context (`app`, `platform`,
/// `appVersion`, `locale`, `screen`, `workflow`) is kept apart from the record it is
/// about (`relatedType`, `relatedId`). The sender is never part of the body: the
/// backend reads it from the bearer token.
class FeedbackReportRequestDto {
  const FeedbackReportRequestDto({
    required this.kind,
    required this.message,
    required this.app,
    required this.platform,
    this.contactEmail,
    this.appVersion,
    this.locale,
    this.screen,
    this.workflow,
    this.relatedType,
    this.relatedId,
  }) : assert(
         (relatedType == null) == (relatedId == null),
         'relatedType and relatedId go together',
       );

  final FeedbackKind kind;
  final String message;
  final FeedbackApp app;

  /// `android` or `ios` (the backend also accepts `web`).
  final String platform;

  /// Required by the backend for a guest, ignored for a signed-in sender.
  final String? contactEmail;
  final String? appVersion;
  final String? locale;

  /// A lowercase key such as `booking/confirm`.
  final String? screen;
  final String? workflow;
  final FeedbackRelatedType? relatedType;
  final String? relatedId;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'kind': kind.wire,
    'message': message.trim(),
    'app': app.wire,
    'platform': platform,
    if (_filled(contactEmail)) 'contact_email': contactEmail!.trim(),
    if (_filled(appVersion)) 'app_version': appVersion!.trim(),
    if (_filled(locale)) 'locale': locale!.trim(),
    if (_filled(screen)) 'screen': screen!.trim(),
    if (_filled(workflow)) 'workflow': workflow!.trim(),
    if (relatedType != null && _filled(relatedId)) ...<String, dynamic>{
      'related_type': relatedType!.wire,
      'related_id': relatedId!.trim(),
    },
  };

  static bool _filled(String? value) =>
      value != null && value.trim().isNotEmpty;
}
