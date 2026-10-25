import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Booking\Enums\BookingStatus` PHP enum.
enum BookingStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('confirmed')
  confirmed,
  @JsonValue('in_progress')
  inProgress,
  @JsonValue('canceled')
  canceled,
  @JsonValue('completed')
  completed,
  @JsonValue('no_show')
  noShow;

  static BookingStatus fromValue(String value) => switch (value) {
    'pending' => BookingStatus.pending,
    'confirmed' => BookingStatus.confirmed,
    'in_progress' => BookingStatus.inProgress,
    'canceled' || 'cancelled' => BookingStatus.canceled,
    'completed' => BookingStatus.completed,
    'no_show' => BookingStatus.noShow,
    _ => throw ArgumentError('Unknown booking status: $value'),
  };

  String get value => switch (this) {
    BookingStatus.pending => 'pending',
    BookingStatus.confirmed => 'confirmed',
    BookingStatus.inProgress => 'in_progress',
    BookingStatus.canceled => 'canceled',
    BookingStatus.completed => 'completed',
    BookingStatus.noShow => 'no_show',
  };
}
