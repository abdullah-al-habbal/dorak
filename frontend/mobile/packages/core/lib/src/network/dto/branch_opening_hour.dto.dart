import 'package:json_annotation/json_annotation.dart';

part 'branch_opening_hour.dto.g.dart';

/// One weekday of a branch's weekly opening hours (`day_of_week` 0-6, times `H:i`).
@JsonSerializable(fieldRename: FieldRename.snake)
class BranchOpeningHourDto {
  final int dayOfWeek;
  @JsonKey(defaultValue: false)
  final bool isClosed;
  final String? opensTime;
  final String? closesTime;

  const BranchOpeningHourDto({
    required this.dayOfWeek,
    this.isClosed = false,
    this.opensTime,
    this.closesTime,
  });

  factory BranchOpeningHourDto.fromJson(Map<String, dynamic> json) =>
      _$BranchOpeningHourDtoFromJson(json);

  /// The write payload: a closed day sends no times (the backend excludes them).
  Map<String, dynamic> toJson() => {
    'day_of_week': dayOfWeek,
    'is_closed': isClosed,
    if (!isClosed) 'opens_time': opensTime,
    if (!isClosed) 'closes_time': closesTime,
  };
}
