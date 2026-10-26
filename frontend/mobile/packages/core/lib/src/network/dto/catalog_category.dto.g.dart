// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'catalog_category.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CatalogCategoryDto _$CatalogCategoryDtoFromJson(Map<String, dynamic> json) =>
    CatalogCategoryDto(
      id: json['id'] as String,
      name: Map<String, String>.from(json['name'] as Map),
      slug: json['slug'] as String,
      parentId: json['parent_id'] as String?,
      universe: json['universe'] as String?,
      isActive: json['is_active'] as bool? ?? true,
    );
