import 'package:core/core.dart';

abstract class StylistAppointmentRepository {
  /// The barber's appointment history, newest first.
  Future<PaginatedData<BookingDto>> getAppointments({
    BookingStatus? status,
    DateTime? from,
    DateTime? to,
    int page = 1,
    int perPage = 15,
  });
}

class DioStylistAppointmentRepository implements StylistAppointmentRepository {
  const DioStylistAppointmentRepository(this._client);

  final ApiClient _client;

  @override
  Future<PaginatedData<BookingDto>> getAppointments({
    BookingStatus? status,
    DateTime? from,
    DateTime? to,
    int page = 1,
    int perPage = 15,
  }) => _client.getPaginated(
    ApiEndpoints.operations.barberAppointments,
    queryParameters: {
      'page': page,
      'per_page': perPage,
      'status': ?status?.value,
      'from': ?_day(from),
      'to': ?_day(to),
    },
    itemParser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
  );

  static String? _day(DateTime? value) =>
      value?.toIso8601String().split('T').first;
}
