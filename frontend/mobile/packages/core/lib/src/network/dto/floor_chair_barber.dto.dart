import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/booking_service.dto.dart';

part 'floor_chair_barber.dto.g.dart';

/// The barber seated at a floor-plan chair, with the services they offer.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class FloorChairBarberDto {
  final String id;
  final String name;
  final List<BookingServiceDto> services;

  const FloorChairBarberDto({
    required this.id,
    required this.name,
    this.services = const [],
  });

  factory FloorChairBarberDto.fromJson(Map<String, dynamic> json) =>
      _$FloorChairBarberDtoFromJson(json);
}
