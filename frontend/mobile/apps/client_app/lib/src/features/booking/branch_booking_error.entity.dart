import 'package:core/core.dart';
import 'package:localization/localization.dart';

abstract final class BranchBookingError {
  static String? atHomeMessage(AppLocalizations l10n, Object? error) {
    if (error is! ApiException) return null;
    return switch (error.code) {
      ApiErrorCodeConstants.apiErrorCodeAtHomeBarberRequired =>
        l10n.bookingAtHomeBarberRequiredMessage,
      ApiErrorCodeConstants.apiErrorCodeAtHomeServiceNotEligible =>
        l10n.bookingAtHomeServiceNotEligibleMessage,
      ApiErrorCodeConstants.apiErrorCodeAtHomeNotOffered =>
        l10n.bookingAtHomeNotOfferedMessage,
      ApiErrorCodeConstants.apiErrorCodeAtHomeOutOfRadius =>
        l10n.bookingAtHomeOutOfRadiusMessage,
      _ => null,
    };
  }

  static String submitMessage(AppLocalizations l10n, Object? error) {
    if (error is ApiException &&
        error.code ==
            ApiErrorCodeConstants.apiErrorCodeBookingOutsideSchedule) {
      return l10n.bookingOutsideScheduleMessage;
    }
    final atHome = atHomeMessage(l10n, error);
    if (atHome != null) return atHome;
    if (error is ApiException && error.statusCode == 409) {
      return l10n.bookingConflictMessage;
    }
    if (error is ValidationException) {
      final fields = error.errors.values
          .expand((messages) => messages)
          .join('\n');
      if (fields.isNotEmpty) return fields;
    }
    if (error is StateError) return l10n.bookingAtHomeLocationError;
    if (error is NetworkException) return l10n.errorNetwork;
    return l10n.errorGeneric;
  }
}
