import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/display_price.dto.dart';

part 'barber_service.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BarberServiceDto {
  final String id;
  final String name;
  final String? description;
  final double price;
  final String? currencyId;
  final int? duration;
  final bool isAtHome;
  final bool active;
  final DateTime? createdAt;
  final DisplayPriceDto? displayPrice;
  @JsonKey(defaultValue: false)
  final bool conversionUnavailable;
  @JsonKey(defaultValue: false)
  final bool isDualPriceDisplayEnabled;

  const BarberServiceDto({
    required this.id,
    required this.name,
    this.description,
    this.price = 0,
    this.currencyId,
    this.duration,
    this.isAtHome = false,
    this.active = true,
    this.createdAt,
    this.displayPrice,
    this.conversionUnavailable = false,
    this.isDualPriceDisplayEnabled = false,
  });

  factory BarberServiceDto.fromJson(Map<String, dynamic> json) =>
      _$BarberServiceDtoFromJson(json);
}
