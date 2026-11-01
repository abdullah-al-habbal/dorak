import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/venue_universe.entity.dart';

part 'catalog_category.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class CatalogCategoryDto {
  final String id;
  final Map<String, String> name;
  final String slug;
  final String? parentId;
  @JsonKey(unknownEnumValue: JsonKey.nullForUndefinedEnumValue)
  final VenueUniverse? universe;
  final bool isActive;

  const CatalogCategoryDto({
    required this.id,
    required this.name,
    required this.slug,
    this.parentId,
    this.universe,
    this.isActive = true,
  });

  factory CatalogCategoryDto.fromJson(Map<String, dynamic> json) =>
      _$CatalogCategoryDtoFromJson(json);
}
