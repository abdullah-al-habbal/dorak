import 'package:core/src/network/exceptions/api.exception.dart';

class ChairHasActiveBookingsException extends ApiException {
  const ChairHasActiveBookingsException({
    required super.statusCode,
    required super.code,
    required super.message,
    required this.bookingIds,
  });

  static const errorCode = 'CHAIR_HAS_ACTIVE_BOOKINGS';

  final List<String> bookingIds;
}
