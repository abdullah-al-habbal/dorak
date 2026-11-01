import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Barber\Enums\BarberStatusEnum` PHP enum.
@JsonEnum()
enum BarberStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('enabled')
  enabled,
  @JsonValue('disabled')
  disabled;

  static BarberStatus fromValue(String value) => switch (value) {
    'pending' => BarberStatus.pending,
    'enabled' => BarberStatus.enabled,
    'disabled' => BarberStatus.disabled,
    _ => throw ArgumentError('Unknown BarberStatus: $value'),
  };

  String get value => switch (this) {
    BarberStatus.pending => 'pending',
    BarberStatus.enabled => 'enabled',
    BarberStatus.disabled => 'disabled',
  };
}
