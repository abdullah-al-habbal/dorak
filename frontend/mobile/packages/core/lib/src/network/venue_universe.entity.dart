import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Core\Enums\VenueUniverse` PHP enum.
enum VenueUniverse {
  @JsonValue('men')
  men,
  @JsonValue('women')
  women,
  @JsonValue('unisex')
  unisex;

  String get value => switch (this) {
    VenueUniverse.men => 'men',
    VenueUniverse.women => 'women',
    VenueUniverse.unisex => 'unisex',
  };
}
