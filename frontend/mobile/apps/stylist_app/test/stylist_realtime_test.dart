import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';

class _FakeRealtime implements RealtimeClient {
  void Function(String event, Map<String, dynamic> payload)? barberListener;

  @override
  RealtimeSubscription subscribeToBarber(
    String barberId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) {
    barberListener = onEvent;
    return RealtimeSubscription.fromCancel(() {});
  }

  @override
  RealtimeSubscription subscribeToBranch(
    String branchId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) => throw UnimplementedError();

  @override
  RealtimeSubscription subscribeToClient(
    String clientId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) => throw UnimplementedError();

  @override
  bool get isConnected => false;

  @override
  Stream<bool> get connectionChanges => const Stream<bool>.empty();

  @override
  Future<void> connect() async {}

  @override
  Future<void> disconnectForLogout() async {}

  @override
  void dispose() {}
}

class _CountingRepository implements StylistOperationsRepository {
  int appointmentLoads = 0;

  @override
  Future<BarberProfileDto> getProfile() async =>
      const BarberProfileDto(id: 'barber-1', name: 'Barber', email: 'b@x.com');

  @override
  Future<PaginatedData<BookingDto>> getTodayAppointments() async {
    appointmentLoads++;
    return const PaginatedData(
      data: [],
      meta: PaginationMeta(
        total: 0,
        count: 0,
        perPage: 15,
        currentPage: 1,
        totalPages: 1,
      ),
    );
  }

  @override
  Future<bool> updateWorkstationStatus(bool online) =>
      throw UnimplementedError();

  @override
  Future<BookingDto> transitionBooking(String id, BarberBookingAction action) =>
      throw UnimplementedError();

  @override
  Future<ReviewDto> rateClient(
    String bookingId, {
    required int rating,
    String? comment,
  }) => throw UnimplementedError();

  @override
  Future<BarberProfileDto> updateProfile({Map<String, String>? bio}) =>
      throw UnimplementedError();

  @override
  Future<List<BarberServiceDto>> getServices() => throw UnimplementedError();

  @override
  Future<BarberServiceDto> createService({
    required Map<String, String> name,
    required double price,
    required String currencyId,
    int? duration,
    bool atHome = false,
    bool active = true,
    String? catalogItemId,
  }) => throw UnimplementedError();

  @override
  Future<BarberServiceDto> updateService(
    String id, {
    required Map<String, String> name,
    required double price,
    required String currencyId,
    int? duration,
    bool atHome = false,
    bool active = true,
    String? catalogItemId,
  }) => throw UnimplementedError();

  @override
  Future<void> deleteService(String id) => throw UnimplementedError();
}

void main() {
  late _CountingRepository repository;
  late _FakeRealtime realtime;
  late StylistBloc bloc;

  setUp(() async {
    repository = _CountingRepository();
    realtime = _FakeRealtime();
    bloc = StylistBloc(repository, realtime: realtime);
    await bloc.load();
  });

  tearDown(() => bloc.close());

  for (final event in [
    'booking.status.updated',
    'booking.cancelled',
    'booking.rescheduled',
    'workstation.status.toggled',
  ]) {
    test('reloads appointments on $event', () async {
      expect(repository.appointmentLoads, 1);

      realtime.barberListener!(event, const {});
      await Future<void>.delayed(Duration.zero);

      expect(repository.appointmentLoads, 2);
    });
  }

  test('ignores unrelated realtime events', () async {
    realtime.barberListener!('booking.created', const {});
    await Future<void>.delayed(Duration.zero);

    expect(repository.appointmentLoads, 1);
  });
}
