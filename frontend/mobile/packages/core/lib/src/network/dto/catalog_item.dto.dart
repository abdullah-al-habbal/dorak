import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/catalog_medium.dto.dart';
import 'package:core/src/network/dto/catalog_price_range.dto.dart';
import 'package:core/src/network/dto/catalog_tag.dto.dart';
import 'package:core/src/network/face_shape.entity.dart';
import 'package:core/src/network/style_period.entity.dart';

part 'catalog_item.dto.g.dart';

Map<String, String> _descriptionFromJson(Object? value) {
  if (value is Map) {
    return value.map((key, entry) => MapEntry(key as String, entry as String));
  }
  return const {};
}

List<FaceShape> _faceShapesFromJson(Object? value) {
  if (value is! List) return const [];
  return [
    for (final entry in value)
      ?FaceShape.tryParse(entry is String ? entry : null),
  ];
}

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class CatalogItemDto {
  final String id;
  final Map<String, String> name;
  @JsonKey(fromJson: _descriptionFromJson)
  final Map<String, String> description;
  final CatalogPriceRangeDto? priceRange;
  @JsonKey(fromJson: _faceShapesFromJson)
  final List<FaceShape> faceShapes;
  @JsonKey(unknownEnumValue: JsonKey.nullForUndefinedEnumValue)
  final StylePeriod? stylePeriod;
  final bool isActive;
  final List<CatalogTagDto> tags;
  final List<CatalogMediumDto> media;
  final int? defaultDurationMinutes;

  const CatalogItemDto({
    required this.id,
    required this.name,
    this.description = const {},
    this.priceRange,
    this.faceShapes = const [],
    this.stylePeriod,
    this.isActive = true,
    this.tags = const [],
    this.media = const [],
    this.defaultDurationMinutes,
  });

  factory CatalogItemDto.fromJson(Map<String, dynamic> json) =>
      _$CatalogItemDtoFromJson(json);
}
