import 'package:core/core.dart';

class BookingStatusTransitions {
  static const Map<BookingStatus, List<BookingStatus>> allowedTargets = {
    BookingStatus.pending: [BookingStatus.confirmed, BookingStatus.canceled],
    BookingStatus.confirmed: [
      BookingStatus.inProgress,
      BookingStatus.canceled,
      BookingStatus.noShow,
    ],
    BookingStatus.inProgress: [
      BookingStatus.completed,
      BookingStatus.canceled,
      BookingStatus.noShow,
    ],
    BookingStatus.completed: [],
    BookingStatus.canceled: [],
    BookingStatus.noShow: [],
  };

  static List<BookingStatus> from(BookingStatus currentStatus) =>
      allowedTargets[currentStatus] ?? const [];
}
