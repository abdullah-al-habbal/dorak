import 'package:json_annotation/json_annotation.dart';

part 'barber_workplace.dto.g.dart';

/// Where a barber works: an accepted affiliation with a branch (and the chair
/// they sit at) or a brand.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BarberWorkplaceDto {
  final String type;
  final String id;
  final String? name;
  final String? chairLabel;

  const BarberWorkplaceDto({
    required this.type,
    required this.id,
    this.name,
    this.chairLabel,
  });

  bool get isBranch => type == 'branch';

  factory BarberWorkplaceDto.fromJson(Map<String, dynamic> json) =>
      _$BarberWorkplaceDtoFromJson(json);
}
