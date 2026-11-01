// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_service.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BookingServiceDto _$BookingServiceDtoFromJson(Map<String, dynamic> json) =>
    BookingServiceDto(
      id: json['id'] as String,
      name: json['name'] as String,
      priceAmountMinor: (json['price_amount_minor'] as num?)?.toInt(),
      duration: (json['duration'] as num?)?.toInt(),
      owner: json['owner'] as String?,
      displayPrice: json['display_price'] == null
          ? null
          : DisplayPriceDto.fromJson(
              json['display_price'] as Map<String, dynamic>,
            ),
      conversionUnavailable: json['conversion_unavailable'] as bool? ?? false,
      isDualPriceDisplayEnabled:
          json['is_dual_price_display_enabled'] as bool? ?? false,
    );

Map<String, dynamic> _$BookingServiceDtoToJson(BookingServiceDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'price_amount_minor': instance.priceAmountMinor,
      'duration': instance.duration,
      'owner': instance.owner,
      'display_price': instance.displayPrice,
      'conversion_unavailable': instance.conversionUnavailable,
      'is_dual_price_display_enabled': instance.isDualPriceDisplayEnabled,
    };
