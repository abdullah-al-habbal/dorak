import 'dart:async';

import 'package:core/core.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class BookingRefreshState extends Equatable {
  const BookingRefreshState({
    required this.booking,
    this.isRefreshing = false,
    this.error,
  });

  final BookingDto booking;
  final bool isRefreshing;
  final Object? error;

  BookingRefreshState copyWith({
    BookingDto? booking,
    bool? isRefreshing,
    Object? error,
    bool clearError = false,
  }) => BookingRefreshState(
    booking: booking ?? this.booking,
    isRefreshing: isRefreshing ?? this.isRefreshing,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [booking, isRefreshing, error];
}

class BookingRefreshCubit extends Cubit<BookingRefreshState> {
  BookingRefreshCubit(
    this._repository,
    BookingDto booking, {
    RealtimeClient? realtime,
    String? clientId,
  }) : _realtime = realtime,
       super(BookingRefreshState(booking: booking)) {
    if (realtime != null && clientId != null) {
      _subscription = realtime.subscribeToClient(clientId, _onRealtime);
      _connectionSubscription = realtime.connectionChanges.listen((connected) {
        if (connected) refresh();
      });
    }
  }

  final BookingRepository _repository;
  final RealtimeClient? _realtime;
  RealtimeSubscription? _subscription;
  StreamSubscription<bool>? _connectionSubscription;
  bool _refreshAgain = false;

  /// Polling is only a fallback: it is skipped while the socket is connected.
  Future<void> pollIfDisconnected() async {
    if (_realtime?.isConnected ?? false) return;
    await refresh();
  }

  void _onRealtime(String event, Map<String, dynamic> payload) {
    if (payload['bookingId'] != state.booking.id) return;
    refresh();
  }

  Future<void> refresh() async {
    if (state.isRefreshing) {
      _refreshAgain = true;
      return;
    }
    emit(state.copyWith(isRefreshing: true, clearError: true));
    try {
      final booking = await _repository.getBooking(state.booking.id);
      if (!isClosed) {
        emit(BookingRefreshState(booking: booking));
      }
    } catch (error) {
      if (!isClosed) {
        emit(state.copyWith(isRefreshing: false, error: error));
      }
    }
    if (_refreshAgain && !isClosed) {
      _refreshAgain = false;
      await refresh();
    }
  }

  @override
  Future<void> close() {
    _subscription?.cancel();
    unawaited(_connectionSubscription?.cancel());
    return super.close();
  }
}
