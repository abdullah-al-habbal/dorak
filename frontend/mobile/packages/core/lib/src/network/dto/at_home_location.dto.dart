import 'package:json_annotation/json_annotation.dart';

part 'at_home_location.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class AtHomeLocationDto {
  final String street;
  final String building;
  final String unit;
  final double latitude;
  final double longitude;

  const AtHomeLocationDto({
    required this.street,
    required this.building,
    required this.unit,
    required this.latitude,
    required this.longitude,
  });

  factory AtHomeLocationDto.fromJson(Map<String, dynamic> json) =>
      _$AtHomeLocationDtoFromJson(json);
}
