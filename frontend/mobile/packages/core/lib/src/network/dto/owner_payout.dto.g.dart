// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'owner_payout.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OwnerPayoutDto _$OwnerPayoutDtoFromJson(Map<String, dynamic> json) =>
    OwnerPayoutDto(
      id: json['id'] as String,
      status: json['status'] as String,
      directionType: json['direction_type'] as String,
      totalAmountMinor: (json['total_amount_minor'] as num).toInt(),
      currencyCode: json['currency_code'] as String,
      periodStartedAt: json['period_started_at'] == null
          ? null
          : DateTime.parse(json['period_started_at'] as String),
      periodEndedAt: json['period_ended_at'] == null
          ? null
          : DateTime.parse(json['period_ended_at'] as String),
      paidAt: json['paid_at'] == null
          ? null
          : DateTime.parse(json['paid_at'] as String),
      externalReference: json['external_reference'] as String?,
    );
