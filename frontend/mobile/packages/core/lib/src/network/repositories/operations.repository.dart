import 'package:core/core.dart';

abstract class BranchOperationsRepository {
  Future<BranchDto> getProfile();
  Future<BranchDashboardDto> getDashboard();
  Future<PaginatedData<BookingDto>> getBookings();
  Future<BookingDto> updateBookingStatus(String id, BookingStatus status);

  /// Rates the client of a completed or no-show booking of this branch.
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? comment,
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
        data: {'status': status.value},
        parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? comment,
  }) => _client.post(
    ApiEndpoints.operations.branchBookingReview(bookingId),
    data: {'rating': rating, 'comment': ?comment},
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
  Future<PaginatedData<BookingDto>> getTodayAppointments();
  Future<bool> updateWorkstationStatus(bool online);
  Future<BookingDto> transitionBooking(String id, BarberBookingAction action);

  /// Rates the client of a completed or no-show booking that has no branch
  /// (at-home); a branch booking is rated by the branch instead.
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? comment,
  });
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
        (json as Map<String, dynamic>)['workstation_online'] as bool,
  );

  @override
  Future<BookingDto> transitionBooking(
    String id,
    BarberBookingAction action,
  ) {
    final endpoint = switch (action) {
      BarberBookingAction.accept => ApiEndpoints.operations.barberBookingAccept(
        id,
      ),
      BarberBookingAction.start => ApiEndpoints.operations.barberBookingStart(
        id,
      ),
      BarberBookingAction.complete =>
        ApiEndpoints.operations.barberBookingComplete(id),
      BarberBookingAction.noShow =>
        ApiEndpoints.operations.barberBookingNoShow(id),
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
    String? comment,
  }) => _client.post(
    ApiEndpoints.operations.barberBookingReview(bookingId),
    data: {'rating': rating, 'comment': ?comment},
    parser: (json) => ReviewDto.fromJson(json as Map<String, dynamic>),
  );
}
