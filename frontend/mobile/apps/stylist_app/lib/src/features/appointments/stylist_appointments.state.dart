import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class StylistAppointmentsState extends Equatable {
  const StylistAppointmentsState({
    this.page = const Paged<BookingDto>.initial(),
    this.status,
  });

  final Paged<BookingDto> page;

  /// The active status filter; null shows every status.
  final BookingStatus? status;

  StylistAppointmentsState copyWith({
    Paged<BookingDto>? page,
    BookingStatus? status,
    bool clearStatus = false,
  }) => StylistAppointmentsState(
    page: page ?? this.page,
    status: clearStatus ? null : status ?? this.status,
  );

  @override
  List<Object?> get props => [page, status];
}
