import 'package:core/core.dart';

abstract class BranchOperationsRepository {
  Future<BranchDto> getProfile();
  Future<BranchDashboardDto> getDashboard();
  Future<PaginatedData<BookingDto>> getBookings();
  Future<BookingDto> updateBookingStatus(String id, String status);
  Future<PaginatedData<FloorChairDto>> getChairs();
  Future<FloorChairDto> updateChairStatus(String id, String status);
}

class DioBranchOperationsRepository implements BranchOperationsRepository {
  const DioBranchOperationsRepository(this._client);
  final ApiClient _client;
  @override
  Future<BranchDto> getProfile() => _client.get(
    BranchEndpoints.profile,
    parser: (json) => BranchDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<BranchDashboardDto> getDashboard() => _client.get(
    OperationsEndpoints.branchDashboard,
    parser: (json) => BranchDashboardDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<PaginatedData<BookingDto>> getBookings() => _client.getPaginated(
    OperationsEndpoints.branchBookings,
    itemParser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<BookingDto> updateBookingStatus(String id, String status) =>
      _client.patch(
        OperationsEndpoints.branchBookingStatus.replaceFirst('{booking}', id),
        data: {'status': status},
        parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<PaginatedData<FloorChairDto>> getChairs() => _client.getPaginated(
    OperationsEndpoints.branchChairs,
    itemParser: (json) => FloorChairDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<FloorChairDto> updateChairStatus(String id, String status) =>
      _client.patch(
        BranchEndpoints.chairStatus.replaceFirst('{chair}', id),
        data: {'status': status},
        parser: (json) => FloorChairDto.fromJson(json as Map<String, dynamic>),
      );
}

abstract class StylistOperationsRepository {
  Future<BarberProfileDto> getProfile();
  Future<PaginatedData<BookingDto>> getTodayAppointments();
  Future<bool> updateWorkstationStatus(bool online);
  Future<BookingDto> transitionBooking(String id, String action);
}

class DioStylistOperationsRepository implements StylistOperationsRepository {
  const DioStylistOperationsRepository(this._client);
  final ApiClient _client;
  @override
  Future<BarberProfileDto> getProfile() => _client.get(
    OperationsEndpoints.barberProfile,
    parser: (json) => BarberProfileDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<PaginatedData<BookingDto>> getTodayAppointments() =>
      _client.getPaginated(
        OperationsEndpoints.barberTodayAppointments,
        itemParser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
      );
  @override
  Future<bool> updateWorkstationStatus(bool online) => _client.patch(
    OperationsEndpoints.barberWorkstationStatus,
    data: {'online': online},
    parser: (json) =>
        (json as Map<String, dynamic>)['workstation_online'] as bool,
  );

  @override
  Future<BookingDto> transitionBooking(String id, String action) {
    final endpoint = switch (action) {
      'accept' => OperationsEndpoints.barberBookingAccept,
      'start' => OperationsEndpoints.barberBookingStart,
      'complete' => OperationsEndpoints.barberBookingComplete,
      'no_show' => OperationsEndpoints.barberBookingNoShow,
      _ => throw ArgumentError.value(action, 'action'),
    };

    return _client.patch(
      endpoint.replaceFirst('{booking}', id),
      parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
