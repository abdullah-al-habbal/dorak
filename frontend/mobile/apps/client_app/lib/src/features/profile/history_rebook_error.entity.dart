import 'package:core/core.dart';
import 'package:localization/localization.dart';

abstract final class HistoryRebookError {
  static String message(Object? error, AppLocalizations l10n) {
    if (error is ApiException && error.statusCode == 409) {
      return l10n.bookingConflictMessage;
    }
    if (error is NetworkException) return l10n.errorNetwork;
    return l10n.errorGeneric;
  }
}
