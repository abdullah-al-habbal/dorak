// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'catalog_medium.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CatalogMediumDto _$CatalogMediumDtoFromJson(Map<String, dynamic> json) =>
    CatalogMediumDto(
      id: json['id'] as String,
      mediaType:
          $enumDecodeNullable(
            _$CatalogMediaTypeEnumMap,
            json['media_type'],
            unknownValue: CatalogMediaType.image,
          ) ??
          CatalogMediaType.image,
      imagePath: json['image_path'] as String,
      altText: json['alt_text'] as String?,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
    );

const _$CatalogMediaTypeEnumMap = {
  CatalogMediaType.image: 'image',
  CatalogMediaType.video: 'video',
};
