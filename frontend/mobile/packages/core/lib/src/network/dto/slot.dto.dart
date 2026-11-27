import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/branch_clock.entity.dart';

part 'slot.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class SlotDto {
  final DateTime startsAt;
  final DateTime endsAt;
  final int? utcOffsetMinutes;

  const SlotDto({
    required this.startsAt,
    required this.endsAt,
    this.utcOffsetMinutes,
  });

  DateTime get startsAtOnBranchClock =>
      BranchClock.read(startsAt, utcOffsetMinutes);

  factory SlotDto.fromJson(Map<String, dynamic> json) =>
      _$SlotDtoFromJson(json);
}
