import 'package:core/core.dart';

class BookingStatusTransitions {
  static const Map<BookingStatus, List<BookingStatus>> allowedTargets = {
    BookingStatus.pending: [BookingStatus.confirmed, BookingStatus.cancelled],
    BookingStatus.confirmed: [
      BookingStatus.inProgress,
      BookingStatus.cancelled,
      BookingStatus.noShow,
    ],
    BookingStatus.inProgress: [
      BookingStatus.completed,
      BookingStatus.cancelled,
      BookingStatus.noShow,
    ],
    BookingStatus.completed: [],
    BookingStatus.cancelled: [],
    BookingStatus.noShow: [],
  };

  static List<BookingStatus> from(BookingStatus currentStatus) =>
      allowedTargets[currentStatus] ?? const [];
}
