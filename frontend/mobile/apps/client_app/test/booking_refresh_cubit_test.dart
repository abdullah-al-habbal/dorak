import 'dart:async';

import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/booking/booking_refresh.bloc.dart';

import 'helpers/fakes.dart';

class _FakeRealtime implements RealtimeClient {
  void Function(String event, Map<String, dynamic> payload)? clientListener;
  String? subscribedClientId;
  bool cancelled = false;
  bool connected = true;
  final connection = StreamController<bool>.broadcast();

  @override
  RealtimeSubscription subscribeToClient(
    String clientId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) {
    subscribedClientId = clientId;
    clientListener = onEvent;
    return RealtimeSubscription.fromCancel(() => cancelled = true);
  }

  @override
  RealtimeSubscription subscribeToBranch(
    String branchId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) => throw UnimplementedError();

  @override
  RealtimeSubscription subscribeToBarber(
    String barberId,
    void Function(String event, Map<String, dynamic> payload) onEvent,
  ) => throw UnimplementedError();

  @override
  bool get isConnected => connected;

  @override
  Stream<bool> get connectionChanges => connection.stream;

  @override
  Future<void> connect() async {}

  @override
  Future<void> disconnectForLogout() async {}

  @override
  void dispose() {}
}

void main() {
  late FakeBookingRepository repository;
  late _FakeRealtime realtime;
  late BookingRefreshCubit cubit;

  setUp(() {
    repository = FakeBookingRepository();
    realtime = _FakeRealtime();
    cubit = BookingRefreshCubit(
      repository,
      testBooking(),
      realtime: realtime,
      clientId: 'client-1',
    );
  });

  tearDown(() => cubit.close());

  test('subscribes to the client channel and cancels on close', () async {
    expect(realtime.subscribedClientId, 'client-1');
    await cubit.close();
    expect(realtime.cancelled, isTrue);
  });

  test('a realtime status event refreshes without polling', () async {
    final bookingId = cubit.state.booking.id;
    realtime.clientListener!('booking.status.updated', {
      'bookingId': bookingId,
      'status': 'confirmed',
    });
    await Future<void>.delayed(Duration.zero);

    expect(repository.getBookingCalls, 1);
  });

  test('events for another booking are ignored', () async {
    realtime.clientListener!('booking.cancelled', {'bookingId': 'other'});
    await Future<void>.delayed(Duration.zero);

    expect(repository.getBookingCalls, 0);
  });

  test(
    'polling is skipped while connected and runs when disconnected',
    () async {
      await cubit.pollIfDisconnected();
      expect(repository.getBookingCalls, 0);

      realtime.connected = false;
      await cubit.pollIfDisconnected();
      expect(repository.getBookingCalls, 1);
    },
  );

  test('reconnecting refreshes to catch missed events', () async {
    realtime.connection.add(true);
    await Future<void>.delayed(Duration.zero);

    expect(repository.getBookingCalls, 1);
  });
}
