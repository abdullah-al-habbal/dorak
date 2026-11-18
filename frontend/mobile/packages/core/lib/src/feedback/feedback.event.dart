import 'package:equatable/equatable.dart';

import 'package:core/src/network/feedback_kind.entity.dart';
import 'package:core/src/network/feedback_related_type.entity.dart';

sealed class FeedbackEvent extends Equatable {
  const FeedbackEvent();

  @override
  List<Object?> get props => [];
}

class FeedbackSubmitted extends FeedbackEvent {
  const FeedbackSubmitted({
    required this.kind,
    required this.message,
    required this.locale,
    required this.screen,
    this.contactEmail,
    this.workflow,
    this.relatedType,
    this.relatedId,
  });

  final FeedbackKind kind;
  final String message;

  /// The language the user sees (`en` or `ar`).
  final String locale;

  /// The screen the form was opened from, as a lowercase key such as `profile/about`.
  final String screen;
  final String? contactEmail;
  final String? workflow;
  final FeedbackRelatedType? relatedType;
  final String? relatedId;

  @override
  List<Object?> get props => [
    kind,
    message,
    locale,
    screen,
    contactEmail,
    workflow,
    relatedType,
    relatedId,
  ];
}

/// Clears a finished or failed attempt, for example when the form is reopened.
class FeedbackReset extends FeedbackEvent {
  const FeedbackReset();
}
