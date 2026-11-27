// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'slot.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SlotDto _$SlotDtoFromJson(Map<String, dynamic> json) => SlotDto(
  startsAt: DateTime.parse(json['starts_at'] as String),
  endsAt: DateTime.parse(json['ends_at'] as String),
  utcOffsetMinutes: (json['utc_offset_minutes'] as num?)?.toInt(),
);
