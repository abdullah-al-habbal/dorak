import 'package:bloc/bloc.dart';
import 'package:flutter/foundation.dart';

import 'package:core/src/external/app_info.provider.dart';
import 'package:core/src/feedback/feedback.event.dart';
import 'package:core/src/feedback/feedback.state.dart';
import 'package:core/src/feedback/feedback_failure.entity.dart';
import 'package:core/src/feedback/feedback_status.entity.dart';
import 'package:core/src/network/dto/feedback_report_request.dto.dart';
import 'package:core/src/network/exceptions/api.exception.dart';
import 'package:core/src/network/exceptions/network.exception.dart';
import 'package:core/src/network/feedback_app.entity.dart';
import 'package:core/src/network/repositories/feedback.repository.dart';

/// Sends one suggestion, bug or support report. It adds the app, platform and
/// version itself, so every app reports the same context. A failure keeps the
/// form usable; nothing is queued or stored.
class FeedbackBloc extends Bloc<FeedbackEvent, FeedbackState> {
  FeedbackBloc(
    this._repository,
    this._app, {
    AppInfoProvider appInfo = const PackageInfoAppInfoProvider(),
    String Function()? platformName,
  }) : // A private field cannot be a named initializing formal.
       // ignore: prefer_initializing_formals
       _appInfo = appInfo,
       _platformName = platformName ?? _runningPlatform,
       super(const FeedbackState()) {
    on<FeedbackSubmitted>(_onSubmitted);
    on<FeedbackReset>((event, emit) => emit(const FeedbackState()));
  }

  final FeedbackRepository _repository;
  final FeedbackApp _app;
  final AppInfoProvider _appInfo;
  final String Function() _platformName;

  static String _runningPlatform() =>
      defaultTargetPlatform == TargetPlatform.iOS ? 'ios' : 'android';

  Future<void> _onSubmitted(
    FeedbackSubmitted event,
    Emitter<FeedbackState> emit,
  ) async {
    if (state.isSending) return;
    emit(const FeedbackState(status: FeedbackStatus.sending));
    try {
      final version = await _appInfo.version();
      await _repository.submit(
        FeedbackReportRequestDto(
          kind: event.kind,
          message: event.message,
          app: _app,
          platform: _platformName(),
          contactEmail: event.contactEmail,
          appVersion: version,
          locale: event.locale,
          screen: event.screen,
          workflow: event.workflow,
          relatedType: event.relatedType,
          relatedId: event.relatedId,
        ),
      );
      if (emit.isDone) return;
      emit(const FeedbackState(status: FeedbackStatus.sent));
    } catch (error) {
      if (emit.isDone) return;
      emit(
        FeedbackState(
          status: FeedbackStatus.failed,
          failure: _failureOf(error),
        ),
      );
    }
  }

  static FeedbackFailure _failureOf(Object error) {
    if (error is NetworkException) return FeedbackFailure.network;
    if (error is ApiException) {
      if (error.isRateLimited) return FeedbackFailure.rateLimited;
      if (error.statusCode == 422) return FeedbackFailure.invalid;
    }
    return FeedbackFailure.unknown;
  }
}
