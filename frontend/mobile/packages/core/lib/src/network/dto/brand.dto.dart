import 'package:json_annotation/json_annotation.dart';

part 'brand.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BrandDto {
  const BrandDto({
    required this.id,
    required this.name,
    this.logoUrl,
    this.slug,
  });

  final String id;
  final Map<String, String> name;
  final String? logoUrl;
  final String? slug;

  factory BrandDto.fromJson(Map<String, dynamic> json) =>
      _$BrandDtoFromJson(json);
}
