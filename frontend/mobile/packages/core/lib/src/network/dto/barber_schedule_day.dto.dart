import 'package:json_annotation/json_annotation.dart';

part 'barber_schedule_day.dto.g.dart';

/// One weekday row of the barber's weekly hours; [dayOfWeek] is 0-6 and the
/// times are `HH:mm` or `HH:mm:ss`.
@JsonSerializable(fieldRename: FieldRename.snake)
class BarberScheduleDayDto {
  const BarberScheduleDayDto({
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    this.isActive = true,
  });

  final int dayOfWeek;
  final String startTime;
  final String endTime;
  final bool isActive;

  factory BarberScheduleDayDto.fromJson(Map<String, dynamic> json) =>
      _$BarberScheduleDayDtoFromJson(json);

  Map<String, dynamic> toJson() => _$BarberScheduleDayDtoToJson(this);
}
