// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'catalog_item.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CatalogItemDto _$CatalogItemDtoFromJson(Map<String, dynamic> json) =>
    CatalogItemDto(
      id: json['id'] as String,
      name: Map<String, String>.from(json['name'] as Map),
      description: json['description'] == null
          ? const {}
          : _descriptionFromJson(json['description']),
      priceRange: json['price_range'] == null
          ? null
          : CatalogPriceRangeDto.fromJson(
              json['price_range'] as Map<String, dynamic>,
            ),
      faceShapes: json['face_shapes'] == null
          ? const []
          : _faceShapesFromJson(json['face_shapes']),
      stylePeriod: $enumDecodeNullable(
        _$StylePeriodEnumMap,
        json['style_period'],
        unknownValue: JsonKey.nullForUndefinedEnumValue,
      ),
      isActive: json['is_active'] as bool? ?? true,
      tags:
          (json['tags'] as List<dynamic>?)
              ?.map((e) => CatalogTagDto.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      media:
          (json['media'] as List<dynamic>?)
              ?.map((e) => CatalogMediumDto.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      defaultDurationMinutes: (json['default_duration_minutes'] as num?)
          ?.toInt(),
    );

const _$StylePeriodEnumMap = {
  StylePeriod.classic: 'classic',
  StylePeriod.modern: 'modern',
};
