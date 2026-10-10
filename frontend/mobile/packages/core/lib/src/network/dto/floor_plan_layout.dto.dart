import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/floor_plan_zone.dto.dart';

part 'floor_plan_layout.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class FloorPlanLayoutDto {
  final String? preset;
  final List<FloorPlanZoneDto> zones;

  const FloorPlanLayoutDto({this.preset, this.zones = const []});

  factory FloorPlanLayoutDto.fromJson(Map<String, dynamic> json) =>
      _$FloorPlanLayoutDtoFromJson(json);
}
