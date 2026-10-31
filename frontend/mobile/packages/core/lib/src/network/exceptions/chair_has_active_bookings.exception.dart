import 'package:core/src/network/exceptions/api.exception.dart';

class ChairHasActiveBookingsException extends ApiException {
  const ChairHasActiveBookingsException({
    required super.statusCode,
    required super.code,
    required super.message,
    required this.bookingIds,
  });

  final List<String> bookingIds;
}
