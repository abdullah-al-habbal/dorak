// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_hours.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BranchHoursDto _$BranchHoursDtoFromJson(Map<String, dynamic> json) =>
    BranchHoursDto(
      dayOfWeek: (json['day_of_week'] as num?)?.toInt(),
      date: json['date'] as String?,
      isClosed: json['is_closed'] as bool? ?? false,
      opensTime: json['opens_time'] as String?,
      closesTime: json['closes_time'] as String?,
      source: $enumDecodeNullable(
        _$BranchHoursSourceEnumMap,
        json['source'],
        unknownValue: JsonKey.nullForUndefinedEnumValue,
      ),
    );

const _$BranchHoursSourceEnumMap = {
  BranchHoursSource.weekly: 'weekly',
  BranchHoursSource.override: 'override',
};
