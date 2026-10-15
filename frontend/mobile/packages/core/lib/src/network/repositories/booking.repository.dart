import 'package:core/core.dart';

abstract class BookingRepository {
  Future<PaginatedData<BookingDto>> getBookings({
    String? status,
    int page = 1,
    int perPage = 20,
  });

  Future<BookingDto> getBooking(String id);

  Future<BookingDto> createBooking({
    String? chairId,
    String? barberId,
    required DateTime timeSlot,
    List<String>? serviceIds,
    String? atHomeStreet,
    String? atHomeBuilding,
    String? atHomeUnit,
    double? atHomeLatitude,
    double? atHomeLongitude,
  });

  Future<void> cancelBooking(String id);
}

class DioBookingRepository implements BookingRepository {
  const DioBookingRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<PaginatedData<BookingDto>> getBookings({
    String? status,
    int page = 1,
    int perPage = 20,
  }) {
    return _apiClient.getPaginated<BookingDto>(
      BookingEndpoints.bookings,
      queryParameters: {'status': ?status, 'page': page, 'per_page': perPage},
      itemParser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<BookingDto> getBooking(String id) {
    return _apiClient.get<BookingDto>(
      BookingEndpoints.bookingDetail.replaceFirst('{booking}', id),
      parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<BookingDto> createBooking({
    String? chairId,
    String? barberId,
    required DateTime timeSlot,
    List<String>? serviceIds,
    String? atHomeStreet,
    String? atHomeBuilding,
    String? atHomeUnit,
    double? atHomeLatitude,
    double? atHomeLongitude,
  }) {
    final atHomeValues = [
      atHomeStreet,
      atHomeBuilding,
      atHomeUnit,
      atHomeLatitude,
      atHomeLongitude,
    ];
    final hasAtHomeLocation = atHomeValues.any((value) => value != null);
    if (hasAtHomeLocation && atHomeValues.any((value) => value == null)) {
      throw ArgumentError(
        'At-home bookings require street, building, unit, latitude, and longitude.',
      );
    }
    if (hasAtHomeLocation && chairId != null) {
      throw ArgumentError('At-home bookings cannot include a chair.');
    }
    final formatted = timeSlot.toUtc().toIso8601String();
    return _apiClient.post<BookingDto>(
      BookingEndpoints.bookings,
      data: {
        'chair_id': ?chairId,
        'barber_id': ?barberId,
        'time_slot': formatted,
        'service_ids': ?serviceIds,
        if (hasAtHomeLocation)
          'at_home_location': {
            'street': atHomeStreet!,
            'building': atHomeBuilding!,
            'unit': atHomeUnit!,
            'latitude': atHomeLatitude!,
            'longitude': atHomeLongitude!,
          },
      },
      parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<void> cancelBooking(String id) {
    return _apiClient.post<void>(
      BookingEndpoints.cancelBooking.replaceFirst('{booking}', id),
      parser: _discardBody,
    );
  }

  static void _discardBody(dynamic _) {}
}
