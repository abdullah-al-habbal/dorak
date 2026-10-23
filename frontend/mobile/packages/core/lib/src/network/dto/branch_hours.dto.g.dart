// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_hours.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BranchHoursDto _$BranchHoursDtoFromJson(Map<String, dynamic> json) =>
    BranchHoursDto(
      weekday: (json['weekday'] as num?)?.toInt(),
      date: json['date'] as String?,
      isClosed: json['is_closed'] as bool? ?? false,
      opensAt: json['opens_at'] as String?,
      closesAt: json['closes_at'] as String?,
      source: json['source'] as String?,
    );
