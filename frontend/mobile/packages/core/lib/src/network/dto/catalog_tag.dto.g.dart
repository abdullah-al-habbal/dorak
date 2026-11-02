// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'catalog_tag.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CatalogTagDto _$CatalogTagDtoFromJson(Map<String, dynamic> json) =>
    CatalogTagDto(
      id: json['id'] as String,
      name: Map<String, String>.from(json['name'] as Map),
      slug: json['slug'] as String,
      groupName: json['group_name'] as String?,
    );
