import 'package:json_annotation/json_annotation.dart';

part 'application_snapshot_service.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ApplicationSnapshotServiceDto {
  final String id;
  final String name;
  final double price;
  final String? currencyCode;
  final int? duration;

  const ApplicationSnapshotServiceDto({
    required this.id,
    required this.name,
    required this.price,
    this.currencyCode,
    this.duration,
  });

  factory ApplicationSnapshotServiceDto.fromJson(Map<String, dynamic> json) =>
      _$ApplicationSnapshotServiceDtoFromJson(json);
}
