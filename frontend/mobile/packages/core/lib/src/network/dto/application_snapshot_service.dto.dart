import 'package:json_annotation/json_annotation.dart';

part 'application_snapshot_service.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ApplicationSnapshotServiceDto {
  final String id;
  final String name;
  final double price;
  final String? currencyId;
  final int? duration;

  const ApplicationSnapshotServiceDto({
    required this.id,
    required this.name,
    required this.price,
    this.currencyId,
    this.duration,
  });

  factory ApplicationSnapshotServiceDto.fromJson(Map<String, dynamic> json) =>
      _$ApplicationSnapshotServiceDtoFromJson(json);
}
