import 'package:core/core.dart';

abstract final class BookingEligibility {
  static bool isCancelable(BookingDto booking) =>
      booking.status == BookingStatus.pending ||
      booking.status == BookingStatus.confirmed;

  static bool isWithinCancellationWindow(BookingDto booking) =>
      booking.cancellationEligible ??
      booking.timeSlot.isAfter(DateTime.now().add(const Duration(hours: 2)));

  static bool canCancel(BookingDto booking, String filter) =>
      filter == 'upcoming' &&
      isCancelable(booking) &&
      isWithinCancellationWindow(booking);

  static bool isRateable(BookingDto booking) =>
      booking.status == BookingStatus.completed;
}
