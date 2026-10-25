import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Chair\Enums\ChairStatus` PHP enum.
enum ChairStatus {
  @JsonValue('available')
  available,
  @JsonValue('occupied')
  occupied,
  @JsonValue('maintenance')
  maintenance;

  static ChairStatus fromValue(String value) => switch (value) {
    'available' => ChairStatus.available,
    'occupied' => ChairStatus.occupied,
    'maintenance' => ChairStatus.maintenance,
    _ => throw ArgumentError('Unknown chair status: $value'),
  };

  String get value => switch (this) {
    ChairStatus.available => 'available',
    ChairStatus.occupied => 'occupied',
    ChairStatus.maintenance => 'maintenance',
  };
}
