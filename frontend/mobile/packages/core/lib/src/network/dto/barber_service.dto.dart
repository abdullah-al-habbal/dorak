import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/display_price.dto.dart';

part 'barber_service.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BarberServiceDto {
  final String id;
  final String name;
  final String? description;
  final int priceAmountMinor;
  final String? currencyCode;
  final int? durationMinutes;
  final bool isAtHome;
  @JsonKey(name: 'is_active', defaultValue: true)
  final bool active;
  final DateTime? createdAt;
  final DisplayPriceDto? displayPrice;
  @JsonKey(defaultValue: false)
  final bool conversionUnavailable;
  @JsonKey(defaultValue: false)
  final bool allowsDualPriceDisplay;

  const BarberServiceDto({
    required this.id,
    required this.name,
    this.description,
    this.priceAmountMinor = 0,
    this.currencyCode,
    this.durationMinutes,
    this.isAtHome = false,
    this.active = true,
    this.createdAt,
    this.displayPrice,
    this.conversionUnavailable = false,
    this.allowsDualPriceDisplay = false,
  });

  factory BarberServiceDto.fromJson(Map<String, dynamic> json) =>
      _$BarberServiceDtoFromJson(json);
}
