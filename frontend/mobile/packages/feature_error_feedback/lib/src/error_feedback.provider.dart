import 'package:core/core.dart';
import 'package:localization/localization.dart';

import 'package:feature_error_feedback/src/safe_server_message.provider.dart';

/// The localized message, and field messages, for a failed request.
class ErrorFeedback {
  const ErrorFeedback({required this.message, this.fieldErrors = const {}});

  /// [unauthorizedMessage] answers 401 and 403, [unprocessableMessage] answers
  /// 422; a screen that rejects credentials passes both. Set
  /// [showsFieldMessagesInBanner] only where no input shows [fieldErrors], so a
  /// form does not repeat them. For validation errors the banner takes the
  /// first of: the 422 override, the joined server messages,
  /// [fallbackMessage], the generic line.
  factory ErrorFeedback.from(
    Object error,
    AppLocalizations l10n, {
    String? fallbackMessage,
    String? unauthorizedMessage,
    String? unprocessableMessage,
    bool showsFieldMessagesInBanner = false,
  }) {
    final fallback = fallbackMessage ?? l10n.errorGeneric;
    if (ApiFailureKind.from(error) == ApiFailureKind.network) {
      return ErrorFeedback(message: l10n.errorNetwork);
    }
    if (error is ValidationException) {
      return ErrorFeedback(
        message:
            unprocessableMessage ??
            (showsFieldMessagesInBanner
                ? SafeServerMessage.joined(error)
                : null) ??
            fallback,
        fieldErrors: {
          for (final MapEntry(:key, :value) in error.errors.entries)
            key: _fieldMessages(value, l10n),
        },
      );
    }
    if (error is! ApiException) return ErrorFeedback(message: fallback);
    final override = switch (error.statusCode) {
      401 || 403 => unauthorizedMessage,
      422 => unprocessableMessage,
      _ => null,
    };
    return ErrorFeedback(
      message: switch (error.code) {
        ApiErrorCodeConstants.apiErrorCodeAccountBanned =>
          l10n.authAccountSuspended,
        ApiErrorCodeConstants.apiErrorCodeAccountNotActive =>
          l10n.authAccountNotActive,
        _ => override ?? fallback,
      },
    );
  }

  final String message;
  final Map<String, List<String>> fieldErrors;

  /// The line for something that could not be loaded.
  static String loadMessage(AppLocalizations l10n, Object? error) =>
      error == null
      ? l10n.errorGeneric
      : ErrorFeedback.from(error, l10n).message;

  static List<String> _fieldMessages(
    List<String> serverMessages,
    AppLocalizations l10n,
  ) {
    final safe = SafeServerMessage.allOf(serverMessages);
    return safe.isEmpty ? [l10n.fieldInvalid] : safe;
  }

  List<String>? errorsFor(String field) => fieldErrors[field];

  String? firstErrorFor(String field) {
    final messages = fieldErrors[field];
    if (messages == null || messages.isEmpty) return null;
    return messages.first;
  }
}
