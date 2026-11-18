import 'package:equatable/equatable.dart';

import 'package:core/src/feedback/feedback_failure.entity.dart';
import 'package:core/src/feedback/feedback_status.entity.dart';

class FeedbackState extends Equatable {
  const FeedbackState({this.status = FeedbackStatus.idle, this.failure});

  final FeedbackStatus status;
  final FeedbackFailure? failure;

  bool get isSending => status == FeedbackStatus.sending;
  bool get isSent => status == FeedbackStatus.sent;

  @override
  List<Object?> get props => [status, failure];
}
