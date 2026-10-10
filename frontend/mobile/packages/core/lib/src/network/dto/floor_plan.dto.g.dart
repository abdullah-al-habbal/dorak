// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'floor_plan.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FloorPlanDto _$FloorPlanDtoFromJson(Map<String, dynamic> json) => FloorPlanDto(
  branchId: json['branch_id'] as String,
  branchName: json['branch_name'] as String,
  floorPlan: json['floor_plan'] == null
      ? null
      : FloorPlanLayoutDto.fromJson(json['floor_plan'] as Map<String, dynamic>),
  chairs:
      (json['chairs'] as List<dynamic>?)
          ?.map((e) => FloorChairDto.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
);
