// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'catalog_medium.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CatalogMediumDto _$CatalogMediumDtoFromJson(Map<String, dynamic> json) =>
    CatalogMediumDto(
      id: json['id'] as String,
      type: json['type'] as String,
      path: json['path'] as String,
      alt: json['alt'] as String?,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
    );
