// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'owner_subscription.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OwnerPlanDto _$OwnerPlanDtoFromJson(Map<String, dynamic> json) => OwnerPlanDto(
  id: json['id'] as String,
  name: localizedMapFromJson(json['name']),
  priceAmountMinor: (json['price_amount_minor'] as num?)?.toInt() ?? 0,
  currencyCode: json['currency_code'] as String?,
  intervalUnit: json['interval_unit'] as String?,
  intervalCount: (json['interval_count'] as num?)?.toInt() ?? 1,
  featureKeys:
      (json['feature_keys'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      [],
);

OwnerSubscriptionDto _$OwnerSubscriptionDtoFromJson(
  Map<String, dynamic> json,
) => OwnerSubscriptionDto(
  id: json['id'] as String,
  status: json['status'] as String,
  brandId: _brandId(json, 'brand_id') as String,
  brandName: localizedMapFromJson(_brandName(json, 'brand_name')),
  plan: OwnerPlanDto.fromJson(json['plan'] as Map<String, dynamic>),
  startsAt: json['starts_at'] == null
      ? null
      : DateTime.parse(json['starts_at'] as String),
  endsAt: json['ends_at'] == null
      ? null
      : DateTime.parse(json['ends_at'] as String),
  pastDueAt: json['past_due_at'] == null
      ? null
      : DateTime.parse(json['past_due_at'] as String),
  graceEndsAt: json['grace_ends_at'] == null
      ? null
      : DateTime.parse(json['grace_ends_at'] as String),
  cancelledAt: json['cancelled_at'] == null
      ? null
      : DateTime.parse(json['cancelled_at'] as String),
);
