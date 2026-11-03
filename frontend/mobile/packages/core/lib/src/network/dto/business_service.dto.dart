import 'package:json_annotation/json_annotation.dart';

part 'business_service.dto.g.dart';

/// A brand-owned service managed from the business app (`/branch/services`).
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BusinessServiceDto {
  final String id;
  final String serviceableId;
  final String name;
  final String? description;
  @JsonKey(defaultValue: 0)
  final int priceAmountMinor;
  final String? currencyCode;
  final int? durationMinutes;
  @JsonKey(defaultValue: false)
  final bool isAtHome;
  @JsonKey(defaultValue: true)
  final bool isActive;

  const BusinessServiceDto({
    required this.id,
    required this.serviceableId,
    required this.name,
    this.description,
    this.priceAmountMinor = 0,
    this.currencyCode,
    this.durationMinutes,
    this.isAtHome = false,
    this.isActive = true,
  });

  factory BusinessServiceDto.fromJson(Map<String, dynamic> json) =>
      _$BusinessServiceDtoFromJson(json);
}
