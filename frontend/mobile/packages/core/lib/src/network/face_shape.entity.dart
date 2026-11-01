import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\ServiceCatalog\Enums\FaceShapeEnum` PHP enum.
@JsonEnum()
enum FaceShape {
  @JsonValue('oval')
  oval,
  @JsonValue('round')
  round,
  @JsonValue('square')
  square,
  @JsonValue('heart')
  heart,
  @JsonValue('diamond')
  diamond,
  @JsonValue('oblong')
  oblong,
  @JsonValue('triangle')
  triangle;

  /// Returns null for values this app version does not know.
  static FaceShape? tryParse(String? value) => switch (value) {
    'oval' => FaceShape.oval,
    'round' => FaceShape.round,
    'square' => FaceShape.square,
    'heart' => FaceShape.heart,
    'diamond' => FaceShape.diamond,
    'oblong' => FaceShape.oblong,
    'triangle' => FaceShape.triangle,
    _ => null,
  };

  String get value => switch (this) {
    FaceShape.oval => 'oval',
    FaceShape.round => 'round',
    FaceShape.square => 'square',
    FaceShape.heart => 'heart',
    FaceShape.diamond => 'diamond',
    FaceShape.oblong => 'oblong',
    FaceShape.triangle => 'triangle',
  };
}
