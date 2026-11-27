import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';

import 'helpers/stylist_fakes.dart';

class _FakeRealtime implements RealtimeClient {
  void Function(String event, Map<String, dynamic> payload)? barberListener;
  int barberSubscriptions = 0;

  @override
  RealtimeSubscription subscribeToBarber(
    String barberId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) {
    barberListener = onEvent;
    barberSubscriptions++;
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
  // Like the real client, signing out kills every listener.
  Future<void> disconnectForLogout() async => barberListener = null;

  @override
  void dispose() {}
}

class _CountingRepository extends FakeStylistOperationsRepository {
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

  test('signing in again rejoins the stylist channel', () async {
    await realtime.disconnectForLogout();
    bloc.endSession();

    await bloc.load();
    expect(realtime.barberListener, isNotNull);
    realtime.barberListener!('booking.cancelled', const {});
    await Future<void>.delayed(Duration.zero);

    expect(realtime.barberSubscriptions, 2);
    expect(repository.appointmentLoads, 3);
  });

  test('a load still running at sign-out joins no channel', () async {
    final late = _FakeRealtime();
    final pending = StylistBloc(_CountingRepository(), realtime: late);

    final load = pending.load();
    pending.endSession();
    await load;

    expect(late.barberSubscriptions, 0);
    expect(pending.state.loading, isFalse);
    await pending.close();
  });

  test('ignores unrelated realtime events', () async {
    realtime.barberListener!('booking.created', const {});
    await Future<void>.delayed(Duration.zero);

    expect(repository.appointmentLoads, 1);
  });
}
