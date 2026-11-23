import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Client\Enums\UniverseEnum` PHP enum: the
/// universe a client browses (a venue may additionally be `unisex`).
@JsonEnum()
enum ClientUniverse {
  @JsonValue('men')
  men,
  @JsonValue('women')
  women;

  String get value => switch (this) {
    ClientUniverse.men => 'men',
    ClientUniverse.women => 'women',
  };
}
