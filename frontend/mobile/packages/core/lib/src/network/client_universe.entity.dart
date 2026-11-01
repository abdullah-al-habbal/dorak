import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Client\Enums\UniverseEnum` PHP enum: the
/// universe a client browses (a venue may additionally be `unisex`).
@JsonEnum()
enum ClientUniverse {
  @JsonValue('men')
  men,
  @JsonValue('women')
  women;

  static ClientUniverse fromValue(String value) => switch (value) {
    'men' => ClientUniverse.men,
    'women' => ClientUniverse.women,
    _ => throw ArgumentError('Unknown ClientUniverse: $value'),
  };

  String get value => switch (this) {
    ClientUniverse.men => 'men',
    ClientUniverse.women => 'women',
  };
}
