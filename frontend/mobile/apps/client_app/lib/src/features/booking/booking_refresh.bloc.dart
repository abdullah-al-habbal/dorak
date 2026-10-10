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
  BookingRefreshCubit(this._repository, BookingDto booking)
    : super(BookingRefreshState(booking: booking));

  final BookingRepository _repository;

  Future<void> refresh() async {
    if (state.isRefreshing) return;
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
  }
}
