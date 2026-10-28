import 'package:json_annotation/json_annotation.dart';

part 'portfolio_photo.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class PortfolioPhotoDto {
  const PortfolioPhotoDto({
    required this.id,
    required this.url,
    this.sortOrder = 0,
  });

  final String id;
  final String url;
  final int sortOrder;

  factory PortfolioPhotoDto.fromJson(Map<String, dynamic> json) =>
      _$PortfolioPhotoDtoFromJson(json);
}
