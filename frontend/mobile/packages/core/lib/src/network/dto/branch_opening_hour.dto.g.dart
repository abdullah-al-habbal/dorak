// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_opening_hour.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BranchOpeningHourDto _$BranchOpeningHourDtoFromJson(
  Map<String, dynamic> json,
) => BranchOpeningHourDto(
  dayOfWeek: (json['day_of_week'] as num).toInt(),
  isClosed: json['is_closed'] as bool? ?? false,
  opensTime: json['opens_time'] as String?,
  closesTime: json['closes_time'] as String?,
);

Map<String, dynamic> _$BranchOpeningHourDtoToJson(
  BranchOpeningHourDto instance,
) => <String, dynamic>{
  'day_of_week': instance.dayOfWeek,
  'is_closed': instance.isClosed,
  'opens_time': instance.opensTime,
  'closes_time': instance.closesTime,
};
