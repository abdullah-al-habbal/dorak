// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'business_service.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BusinessServiceDto _$BusinessServiceDtoFromJson(Map<String, dynamic> json) =>
    BusinessServiceDto(
      id: json['id'] as String,
      serviceableId: json['serviceable_id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      priceAmountMinor: (json['price_amount_minor'] as num?)?.toInt() ?? 0,
      currencyCode: json['currency_code'] as String?,
      durationMinutes: (json['duration_minutes'] as num?)?.toInt(),
      isAtHome: json['is_at_home'] as bool? ?? false,
      isActive: json['is_active'] as bool? ?? true,
    );
