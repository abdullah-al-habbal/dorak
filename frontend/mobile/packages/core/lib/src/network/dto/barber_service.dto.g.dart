// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'barber_service.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BarberServiceDto _$BarberServiceDtoFromJson(
  Map<String, dynamic> json,
) => BarberServiceDto(
  id: json['id'] as String,
  name: json['name'] as String,
  description: json['description'] as String?,
  priceAmountMinor: (json['price_amount_minor'] as num?)?.toInt() ?? 0,
  currencyCode: json['currency_code'] as String?,
  durationMinutes: (json['duration_minutes'] as num?)?.toInt(),
  isAtHome: json['is_at_home'] as bool? ?? false,
  active: json['active'] as bool? ?? true,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  displayPrice: json['display_price'] == null
      ? null
      : DisplayPriceDto.fromJson(json['display_price'] as Map<String, dynamic>),
  conversionUnavailable: json['conversion_unavailable'] as bool? ?? false,
  allowsDualPriceDisplay: json['allows_dual_price_display'] as bool? ?? false,
);
