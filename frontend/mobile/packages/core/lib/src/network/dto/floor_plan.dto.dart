import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/booking_service.dto.dart';
import 'package:core/src/network/dto/floor_chair.dto.dart';
import 'package:core/src/network/dto/floor_plan_layout.dto.dart';

part 'floor_plan.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class FloorPlanDto {
  final String branchId;
  final String branchName;
  final FloorPlanLayoutDto? floorPlan;
  final List<FloorChairDto> chairs;

  /// The shop's own menu, used for chairs without a seated barber.
  final List<BookingServiceDto> branchServices;

  const FloorPlanDto({
    required this.branchId,
    required this.branchName,
    this.floorPlan,
    this.chairs = const [],
    this.branchServices = const [],
  });

  factory FloorPlanDto.fromJson(Map<String, dynamic> json) =>
      _$FloorPlanDtoFromJson(json);
}
