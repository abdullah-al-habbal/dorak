// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'application_snapshot_service.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ApplicationSnapshotServiceDto _$ApplicationSnapshotServiceDtoFromJson(
  Map<String, dynamic> json,
) => ApplicationSnapshotServiceDto(
  id: json['id'] as String,
  name: json['name'] as String,
  priceAmountMinor: (json['price_amount_minor'] as num).toInt(),
  currencyCode: json['currency_code'] as String?,
  durationMinutes: (json['duration_minutes'] as num?)?.toInt(),
);
