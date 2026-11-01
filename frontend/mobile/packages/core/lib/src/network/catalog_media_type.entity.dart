import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\ServiceCatalog\Enums\MediaTypeEnum` PHP enum.
@JsonEnum()
enum CatalogMediaType {
  @JsonValue('image')
  image,
  @JsonValue('video')
  video;

  /// Returns null for values this app version does not know.
  static CatalogMediaType? tryParse(String? value) => switch (value) {
    'image' => CatalogMediaType.image,
    'video' => CatalogMediaType.video,
    _ => null,
  };

  String get value => switch (this) {
    CatalogMediaType.image => 'image',
    CatalogMediaType.video => 'video',
  };
}
