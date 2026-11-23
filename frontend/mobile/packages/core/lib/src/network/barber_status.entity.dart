import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Barber\Enums\BarberStatusEnum` PHP enum.
@JsonEnum()
enum BarberStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('enabled')
  enabled,
  @JsonValue('disabled')
  disabled,
  @JsonValue('rejected')
  rejected;

  String get value => switch (this) {
    BarberStatus.pending => 'pending',
    BarberStatus.enabled => 'enabled',
    BarberStatus.disabled => 'disabled',
    BarberStatus.rejected => 'rejected',
  };
}
