import 'package:json_annotation/json_annotation.dart';

part 'catalog_tag.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class CatalogTagDto {
  final String id;
  final Map<String, String> name;
  final String slug;
  final String? groupName;

  const CatalogTagDto({
    required this.id,
    required this.name,
    required this.slug,
    this.groupName,
  });

  factory CatalogTagDto.fromJson(Map<String, dynamic> json) =>
      _$CatalogTagDtoFromJson(json);
}
