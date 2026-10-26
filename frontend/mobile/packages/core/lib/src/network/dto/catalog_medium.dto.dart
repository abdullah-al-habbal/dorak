import 'package:json_annotation/json_annotation.dart';

part 'catalog_medium.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class CatalogMediumDto {
  final String id;
  final String type;
  final String path;
  final String? alt;
  final int sortOrder;

  const CatalogMediumDto({
    required this.id,
    required this.type,
    required this.path,
    this.alt,
    this.sortOrder = 0,
  });

  factory CatalogMediumDto.fromJson(Map<String, dynamic> json) =>
      _$CatalogMediumDtoFromJson(json);
}
