import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Core\Enums\VenueUniverse` PHP enum.
enum VenueUniverse {
  @JsonValue('men')
  men,
  @JsonValue('women')
  women,
  @JsonValue('unisex')
  unisex;

  static VenueUniverse fromValue(String value) => switch (value) {
    'men' => VenueUniverse.men,
    'women' => VenueUniverse.women,
    'unisex' => VenueUniverse.unisex,
    _ => throw ArgumentError('Unknown VenueUniverse: $value'),
  };

  String get value => switch (this) {
    VenueUniverse.men => 'men',
    VenueUniverse.women => 'women',
    VenueUniverse.unisex => 'unisex',
  };
}
