import 'package:json_annotation/json_annotation.dart';

part 'brand.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BrandDto {
  const BrandDto({
    required this.id,
    required this.name,
    this.logoUrl,
    this.slug,
    this.status,
  });

  final String id;
  final Map<String, String> name;
  final String? logoUrl;
  final String? slug;

  /// `pending` until a platform admin approves the brand (Gap G2), then `active`.
  final String? status;

  factory BrandDto.fromJson(Map<String, dynamic> json) =>
      _$BrandDtoFromJson(json);
}
