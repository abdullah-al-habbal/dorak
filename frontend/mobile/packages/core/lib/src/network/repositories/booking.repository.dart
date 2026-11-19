import 'package:core/core.dart';
import 'package:core/src/network/api_client_constants.entity.dart';

abstract class BookingRepository {
  Future<PaginatedData<BookingDto>> getBookings({
    String? status,
    int page = 1,
    int perPage = 20,
  });

  Future<BookingDto> getBooking(String id);

  Future<BookingDto> createBooking({
    String? chairId,
    String? branchId,
    String? barberId,
    required DateTime startsAt,
    required List<String> serviceIds,
    String? atHomeStreet,
    String? atHomeBuilding,
    String? atHomeUnit,
    double? atHomeLatitude,
    double? atHomeLongitude,
    String? idempotencyKey,
  });

  Future<void> cancelBooking(String id);

  Future<List<SlotDto>> getBarberSlots(
    String barberId, {
    required DateTime date,
    required List<String> serviceIds,
    double? atHomeLatitude,
    double? atHomeLongitude,
  });
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
      ApiEndpoints.booking.bookings,
      queryParameters: {'status': ?status, 'page': page, 'per_page': perPage},
      itemParser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<BookingDto> getBooking(String id) {
    return _apiClient.get<BookingDto>(
      ApiEndpoints.booking.bookingDetail(id),
      parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<BookingDto> createBooking({
    String? chairId,
    String? branchId,
    String? barberId,
    required DateTime startsAt,
    required List<String> serviceIds,
    String? atHomeStreet,
    String? atHomeBuilding,
    String? atHomeUnit,
    double? atHomeLatitude,
    double? atHomeLongitude,
    String? idempotencyKey,
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
    if (chairId != null && branchId != null) {
      throw ArgumentError('Chair bookings cannot include a branch.');
    }
    if (serviceIds.isEmpty) {
      throw ArgumentError('Bookings require at least one service.');
    }
    final formatted = startsAt.toUtc().toIso8601String();
    return _apiClient.post<BookingDto>(
      ApiEndpoints.booking.bookings,
      data: {
        'chair_id': ?chairId,
        'branch_id': ?branchId,
        'barber_id': ?barberId,
        'starts_at': formatted,
        'service_ids': serviceIds,
        if (hasAtHomeLocation)
          'home_address': {
            'street': atHomeStreet!,
            'building': atHomeBuilding!,
            'unit': atHomeUnit!,
            'latitude': atHomeLatitude!,
            'longitude': atHomeLongitude!,
          },
      },
      headers: {ApiClientConstants.apiClientIdempotencyHeader: ?idempotencyKey},
      parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<void> cancelBooking(String id) {
    return _apiClient.post<void>(
      ApiEndpoints.booking.cancelBooking(id),
      parser: _discardBody,
    );
  }

  @override
  Future<List<SlotDto>> getBarberSlots(
    String barberId, {
    required DateTime date,
    required List<String> serviceIds,
    double? atHomeLatitude,
    double? atHomeLongitude,
  }) {
    final isAtHome = atHomeLatitude != null && atHomeLongitude != null;
    final query = <String, dynamic>{
      'date': date.toUtc().toIso8601String().split('T').first,
      'service_ids': serviceIds,
      if (isAtHome) 'is_at_home': 1,
      if (isAtHome) 'latitude': atHomeLatitude,
      if (isAtHome) 'longitude': atHomeLongitude,
    };
    return _apiClient.get<List<SlotDto>>(
      ApiEndpoints.booking.barberSlots(barberId),
      queryParameters: query,
      parser: (json) {
        if (json is List) {
          return json
              .whereType<Map<String, dynamic>>()
              .map(SlotDto.fromJson)
              .toList();
        }
        throw const FormatException('Expected a list of slots');
      },
    );
  }

  static void _discardBody(dynamic _) {}
}
