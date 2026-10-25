import 'package:core/core.dart';
import 'package:localization/localization.dart';

abstract final class BranchBookingError {
  static String? atHomeMessage(AppLocalizations l10n, Object? error) {
    if (error is! ApiException) return null;
    return switch (error.code) {
      'at_home_barber_required' => l10n.bookingAtHomeBarberRequiredMessage,
      'at_home_service_not_eligible' =>
        l10n.bookingAtHomeServiceNotEligibleMessage,
      'at_home_not_offered' => l10n.bookingAtHomeNotOfferedMessage,
      'at_home_out_of_radius' => l10n.bookingAtHomeOutOfRadiusMessage,
      _ => null,
    };
  }

  static String submitMessage(AppLocalizations l10n, Object? error) {
    if (error is ApiException && error.code == 'booking_outside_schedule') {
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
