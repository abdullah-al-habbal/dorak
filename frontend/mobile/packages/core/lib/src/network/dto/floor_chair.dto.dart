import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/floor_chair_barber.dto.dart';

part 'floor_chair.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class FloorChairDto {
  final String id;
  final String? label;
  final String status;
  final String? availability;
  final String? floorZone;
  final Map<String, dynamic>? uiMetadata;
  final String? branchId;
  final FloorChairBarberDto? barber;
  @JsonKey(defaultValue: 'branch')
  final String servicesSource;

  const FloorChairDto({
    required this.id,
    this.label,
    required this.status,
    this.availability,
    this.floorZone,
    this.uiMetadata,
    this.branchId,
    this.barber,
    this.servicesSource = 'branch',
  });

  factory FloorChairDto.fromJson(Map<String, dynamic> json) =>
      _$FloorChairDtoFromJson(json);
}
