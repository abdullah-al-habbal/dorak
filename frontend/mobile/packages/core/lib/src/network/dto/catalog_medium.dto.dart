import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/catalog_media_type.entity.dart';

part 'catalog_medium.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class CatalogMediumDto {
  final String id;
  @JsonKey(
    defaultValue: CatalogMediaType.image,
    unknownEnumValue: CatalogMediaType.image,
  )
  final CatalogMediaType type;
  final String path;
  final String? alt;
  final int sortOrder;

  const CatalogMediumDto({
    required this.id,
    this.type = CatalogMediaType.image,
    required this.path,
    this.alt,
    this.sortOrder = 0,
  });

  factory CatalogMediumDto.fromJson(Map<String, dynamic> json) =>
      _$CatalogMediumDtoFromJson(json);
}
