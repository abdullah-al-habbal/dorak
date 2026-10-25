// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'display_price.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DisplayPriceDto _$DisplayPriceDtoFromJson(Map<String, dynamic> json) =>
    DisplayPriceDto(
      amount: (json['amount'] as num).toDouble(),
      currencyCode: json['currency_code'] as String,
    );

Map<String, dynamic> _$DisplayPriceDtoToJson(DisplayPriceDto instance) =>
    <String, dynamic>{
      'amount': instance.amount,
      'currency_code': instance.currencyCode,
    };
