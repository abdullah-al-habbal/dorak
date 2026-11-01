// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'display_price.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DisplayPriceDto _$DisplayPriceDtoFromJson(Map<String, dynamic> json) =>
    DisplayPriceDto(
      amountMinor: (json['amount_minor'] as num).toInt(),
      currencyCode: json['currency_code'] as String,
    );

Map<String, dynamic> _$DisplayPriceDtoToJson(DisplayPriceDto instance) =>
    <String, dynamic>{
      'amount_minor': instance.amountMinor,
      'currency_code': instance.currencyCode,
    };
