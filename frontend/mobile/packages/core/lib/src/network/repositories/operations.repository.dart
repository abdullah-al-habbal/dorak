import 'package:core/core.dart';
import 'package:dio/dio.dart';

abstract class BranchOperationsRepository {
  Future<BranchDto> getProfile();
  Future<BranchDashboardDto> getDashboard();
  Future<PaginatedData<BookingDto>> getBookings();
  Future<BookingDto> updateBookingStatus(String id, BookingStatus status);

  /// Rates the client of a completed or no-show booking of this branch.
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? body,
  });
  Future<PaginatedData<FloorChairDto>> getChairs();
  Future<FloorChairDto> updateChairStatus(
    String id,
    ChairStatus status, {
    bool force = false,
  });
}

class DioBranchOperationsRepository implements BranchOperationsRepository {
  const DioBranchOperationsRepository(this._client);
  final ApiClient _client;
  @override
  Future<BranchDto> getProfile() => _client.get(
    ApiEndpoints.branch.profile,
    parser: (json) => BranchDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<BranchDashboardDto> getDashboard() => _client.get(
    ApiEndpoints.operations.branchDashboard,
    parser: (json) => BranchDashboardDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<PaginatedData<BookingDto>> getBookings() => _client.getPaginated(
    ApiEndpoints.operations.branchBookings,
    itemParser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<BookingDto> updateBookingStatus(String id, BookingStatus status) =>
      _client.patch(
        ApiEndpoints.operations.branchBookingStatus(id),
        data: {'booking_status': status.value},
        parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? body,
  }) => _client.post(
    ApiEndpoints.operations.branchBookingReview(bookingId),
    data: {'rating': rating, 'body': ?body},
    parser: (json) => ReviewDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<PaginatedData<FloorChairDto>> getChairs() => _client.getPaginated(
    ApiEndpoints.operations.branchChairs,
    itemParser: (json) => FloorChairDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<FloorChairDto> updateChairStatus(
    String id,
    ChairStatus status, {
    bool force = false,
  }) => _client.patch(
    ApiEndpoints.branch.chairStatus(id),
    data: {'status': status.value, if (force) 'force': true},
    parser: (json) => FloorChairDto.fromJson(json as Map<String, dynamic>),
  );
}

abstract class StylistOperationsRepository {
  Future<BarberProfileDto> getProfile();

  /// Updates the authenticated barber's own bio (Task 54); `bio` carries both
  /// locales, e.g. `{'en': '...', 'ar': '...'}`.
  Future<BarberProfileDto> updateProfile({Map<String, String>? bio});
  Future<PaginatedData<BookingDto>> getTodayAppointments();
  Future<bool> updateWorkstationStatus(bool online);
  Future<BookingDto> transitionBooking(String id, BarberBookingAction action);

  /// Rates the client of a completed or no-show booking that has no branch
  /// (at-home); a branch booking is rated by the branch instead.
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? body,
  });

  /// Cancels a booking assigned to this barber; [reason] is required by the
  /// backend (`cancellation_reason`).
  Future<BookingDto> cancelBooking(String id, {required String reason});

  Future<List<BarberScheduleDayDto>> getSchedule();

  /// Replaces the whole weekly schedule.
  Future<List<BarberScheduleDayDto>> updateSchedule(
    List<BarberScheduleDayDto> days,
  );
  Future<List<PortfolioPhotoDto>> getPortfolio();
  Future<PortfolioPhotoDto> uploadPortfolioPhoto(String filePath);
  Future<void> deletePortfolioPhoto(String id);
  Future<BarberProfileDto> updateTravelRadius(double radiusKm);

  /// The authenticated barber's own services (Task 54; UI in Task 83).
  Future<List<BarberServiceDto>> getServices();
  Future<BarberServiceDto> createService({
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    int? durationMinutes,
    bool isAtHome = false,
    bool active = true,
    String? catalogItemId,
  });
  Future<BarberServiceDto> updateService(
    String id, {
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    int? durationMinutes,
    bool isAtHome = false,
    bool active = true,
    String? catalogItemId,
  });
  Future<void> deleteService(String id);
}

class DioStylistOperationsRepository implements StylistOperationsRepository {
  const DioStylistOperationsRepository(this._client);
  final ApiClient _client;
  @override
  Future<BarberProfileDto> getProfile() => _client.get(
    ApiEndpoints.operations.barberProfile,
    parser: (json) => BarberProfileDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<PaginatedData<BookingDto>> getTodayAppointments() =>
      _client.getPaginated(
        ApiEndpoints.operations.barberTodayAppointments,
        itemParser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<bool> updateWorkstationStatus(bool online) => _client.patch(
    ApiEndpoints.operations.barberWorkstationStatus,
    data: {'online': online},
    parser: (json) =>
        (json as Map<String, dynamic>)['is_workstation_online'] as bool,
  );

  @override
  Future<BookingDto> transitionBooking(String id, BarberBookingAction action) {
    final endpoint = switch (action) {
      BarberBookingAction.accept => ApiEndpoints.operations.barberBookingAccept(
        id,
      ),
      BarberBookingAction.start => ApiEndpoints.operations.barberBookingStart(
        id,
      ),
      BarberBookingAction.complete =>
        ApiEndpoints.operations.barberBookingComplete(id),
      BarberBookingAction.noShow => ApiEndpoints.operations.barberBookingNoShow(
        id,
      ),
    };

    return _client.patch(
      endpoint,
      parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? body,
  }) => _client.post(
    ApiEndpoints.operations.barberBookingReview(bookingId),
    data: {'rating': rating, 'body': ?body},
    parser: (json) => ReviewDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<BarberProfileDto> updateProfile({Map<String, String>? bio}) =>
      _client.patch(
        ApiEndpoints.operations.barberProfile,
        data: {'bio': ?bio},
        parser: (json) =>
            BarberProfileDto.fromJson(json as Map<String, dynamic>),
      );

  @override
  Future<BookingDto> cancelBooking(String id, {required String reason}) =>
      _client.post(
        ApiEndpoints.operations.barberBookingCancel(id),
        data: {'cancellation_reason': reason},
        parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
      );

  @override
  Future<List<BarberScheduleDayDto>> getSchedule() => _client.get(
    ApiEndpoints.operations.barberSchedule,
    parser: _parseSchedule,
  );

  @override
  Future<List<BarberScheduleDayDto>> updateSchedule(
    List<BarberScheduleDayDto> days,
  ) => _client.patch(
    ApiEndpoints.operations.barberSchedule,
    data: {'schedule': days.map((day) => day.toJson()).toList()},
    parser: _parseSchedule,
  );

  @override
  Future<List<PortfolioPhotoDto>> getPortfolio() => _client.get(
    ApiEndpoints.operations.barberPortfolio,
    parser: (json) => (json as List<dynamic>)
        .map((item) => PortfolioPhotoDto.fromJson(item as Map<String, dynamic>))
        .toList(),
  );

  @override
  Future<PortfolioPhotoDto> uploadPortfolioPhoto(String filePath) async {
    final form = FormData.fromMap({
      'photo': await MultipartFile.fromFile(filePath),
    });
    return _client.post(
      ApiEndpoints.operations.barberPortfolio,
      data: form,
      parser: (json) =>
          PortfolioPhotoDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<void> deletePortfolioPhoto(String id) =>
      _client.delete(ApiEndpoints.operations.barberPortfolioPhoto(id));

  @override
  Future<BarberProfileDto> updateTravelRadius(double radiusKm) => _client.patch(
    ApiEndpoints.operations.barberTravelRadius,
    data: {'travel_radius_km': radiusKm},
    parser: (json) => BarberProfileDto.fromJson(json as Map<String, dynamic>),
  );

  static List<BarberScheduleDayDto> _parseSchedule(Object? json) =>
      (json as List<dynamic>)
          .map(
            (item) =>
                BarberScheduleDayDto.fromJson(item as Map<String, dynamic>),
          )
          .toList();

  @override
  Future<List<BarberServiceDto>> getServices() => _client.get(
    ApiEndpoints.operations.barberServices,
    parser: (json) => (json as List<dynamic>)
        .map((item) => BarberServiceDto.fromJson(item as Map<String, dynamic>))
        .toList(),
  );

  @override
  Future<BarberServiceDto> createService({
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    int? durationMinutes,
    bool isAtHome = false,
    bool active = true,
    String? catalogItemId,
  }) => _client.post(
    ApiEndpoints.operations.barberServices,
    data: _servicePayload(
      name: name,
      price: price,
      currencyCode: currencyCode,
      durationMinutes: durationMinutes,
      isAtHome: isAtHome,
      active: active,
      catalogItemId: catalogItemId,
    ),
    parser: (json) => BarberServiceDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<BarberServiceDto> updateService(
    String id, {
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    int? durationMinutes,
    bool isAtHome = false,
    bool active = true,
    String? catalogItemId,
  }) => _client.put(
    ApiEndpoints.operations.barberService(id),
    data: _servicePayload(
      name: name,
      price: price,
      currencyCode: currencyCode,
      durationMinutes: durationMinutes,
      isAtHome: isAtHome,
      active: active,
      catalogItemId: catalogItemId,
    ),
    parser: (json) => BarberServiceDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<void> deleteService(String id) =>
      _client.delete(ApiEndpoints.operations.barberService(id));

  Map<String, dynamic> _servicePayload({
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    int? durationMinutes,
    required bool isAtHome,
    required bool active,
    String? catalogItemId,
  }) => {
    'name': name,
    'price_amount_minor': MinorUnits.fromMajor(price),
    'currency_code': currencyCode,
    'duration_minutes': ?durationMinutes,
    'is_at_home': isAtHome,
    'is_active': active,
    'catalog_item_id': ?catalogItemId,
  };
}
