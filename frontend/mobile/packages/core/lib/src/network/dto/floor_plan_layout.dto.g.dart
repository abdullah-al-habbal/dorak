// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'floor_plan_layout.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FloorPlanLayoutDto _$FloorPlanLayoutDtoFromJson(Map<String, dynamic> json) =>
    FloorPlanLayoutDto(
      preset: json['preset'] as String?,
      zones:
          (json['zones'] as List<dynamic>?)
              ?.map((e) => FloorPlanZoneDto.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
