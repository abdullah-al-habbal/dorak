import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class StylistState extends Equatable {
  StylistState({
    this.loading = false,
    this.online = false,
    this.updatingBookingId,
    List<BookingDto> appointments = const [],
    this.error,
  }) : appointments = List.unmodifiable(appointments);

  final bool loading;
  final bool online;
  final String? updatingBookingId;
  final List<BookingDto> appointments;
  final Object? error;

  StylistState copyWith({
    bool? loading,
    bool? online,
    String? updatingBookingId,
    bool clearUpdatingBooking = false,
    List<BookingDto>? appointments,
    Object? error,
    bool clearError = false,
  }) => StylistState(
    loading: loading ?? this.loading,
    online: online ?? this.online,
    updatingBookingId: clearUpdatingBooking
        ? null
        : updatingBookingId ?? this.updatingBookingId,
    appointments: appointments ?? this.appointments,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [
    loading,
    online,
    updatingBookingId,
    appointments,
    error,
  ];
}
