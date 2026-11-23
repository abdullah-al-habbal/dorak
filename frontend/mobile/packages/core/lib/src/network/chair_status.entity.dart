import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Chair\Enums\ChairStatus` PHP enum.
enum ChairStatus {
  @JsonValue('available')
  available,
  @JsonValue('occupied')
  occupied,
  @JsonValue('maintenance')
  maintenance,
  /// Any status this app version does not know; never sent to the backend.
  unknown;

  static ChairStatus fromValue(String value) => switch (value) {
    'available' => ChairStatus.available,
    'occupied' => ChairStatus.occupied,
    'maintenance' => ChairStatus.maintenance,
    _ => ChairStatus.unknown,
  };

  String get value => switch (this) {
    ChairStatus.available => 'available',
    ChairStatus.occupied => 'occupied',
    ChairStatus.maintenance => 'maintenance',
    ChairStatus.unknown => 'unknown',
  };
}
