import 'package:json_annotation/json_annotation.dart';

part 'slot.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class SlotDto {
  final DateTime startsAt;
  final DateTime endsAt;

  const SlotDto({required this.startsAt, required this.endsAt});

  factory SlotDto.fromJson(Map<String, dynamic> json) => _$SlotDtoFromJson(json);
}
