// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'earnings.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EarningsDto _$EarningsDtoFromJson(Map<String, dynamic> json) => EarningsDto(
  scope: json['scope'] as String,
  totals:
      (json['totals'] as List<dynamic>?)
          ?.map((e) => EarningsTotalDto.fromJson(e as Map<String, dynamic>))
          .toList() ??
      [],
);
