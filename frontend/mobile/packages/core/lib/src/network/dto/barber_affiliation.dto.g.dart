// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'barber_affiliation.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BarberAffiliationDto _$BarberAffiliationDtoFromJson(
  Map<String, dynamic> json,
) => BarberAffiliationDto(
  id: json['id'] as String,
  barberId: json['barber_id'] as String,
  affiliableId: json['affiliable_id'] as String,
  affiliableType: json['affiliable_type'] as String,
  status: json['status'] as String,
  commissionPercent: (json['commission_percent'] as num?)?.toDouble(),
  invitedAt: json['invited_at'] == null
      ? null
      : DateTime.parse(json['invited_at'] as String),
  acceptedAt: json['accepted_at'] == null
      ? null
      : DateTime.parse(json['accepted_at'] as String),
  terminatedAt: json['terminated_at'] == null
      ? null
      : DateTime.parse(json['terminated_at'] as String),
);
