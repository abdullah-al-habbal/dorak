import 'package:json_annotation/json_annotation.dart';

part 'floor_plan_zone.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class FloorPlanZoneDto {
  final String zone;
  final double x;
  final double y;
  final double width;
  final double height;

  const FloorPlanZoneDto({
    required this.zone,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
  });

  factory FloorPlanZoneDto.fromJson(Map<String, dynamic> json) =>
      _$FloorPlanZoneDtoFromJson(json);
}
