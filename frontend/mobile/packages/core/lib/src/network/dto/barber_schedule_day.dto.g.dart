// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'barber_schedule_day.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BarberScheduleDayDto _$BarberScheduleDayDtoFromJson(
  Map<String, dynamic> json,
) => BarberScheduleDayDto(
  dayOfWeek: (json['day_of_week'] as num).toInt(),
  startTime: json['start_time'] as String,
  endTime: json['end_time'] as String,
  isActive: json['is_active'] as bool? ?? true,
);

Map<String, dynamic> _$BarberScheduleDayDtoToJson(
  BarberScheduleDayDto instance,
) => <String, dynamic>{
  'day_of_week': instance.dayOfWeek,
  'start_time': instance.startTime,
  'end_time': instance.endTime,
  'is_active': instance.isActive,
};
