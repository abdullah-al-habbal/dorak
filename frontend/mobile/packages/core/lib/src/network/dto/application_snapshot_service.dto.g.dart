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
  price: (json['price'] as num).toDouble(),
  currencyId: json['currency_id'] as String?,
  duration: (json['duration'] as num?)?.toInt(),
);
