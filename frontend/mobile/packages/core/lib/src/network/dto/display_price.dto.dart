import 'package:json_annotation/json_annotation.dart';

part 'display_price.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: true)
class DisplayPriceDto {
  final double amount;
  final String currencyCode;

  const DisplayPriceDto({required this.amount, required this.currencyCode});

  factory DisplayPriceDto.fromJson(Map<String, dynamic> json) =>
      _$DisplayPriceDtoFromJson(json);

  Map<String, dynamic> toJson() => _$DisplayPriceDtoToJson(this);
}
