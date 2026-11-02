import 'package:json_annotation/json_annotation.dart';

part 'application_snapshot_service.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ApplicationSnapshotServiceDto {
  final String id;
  final String name;
  final int priceAmountMinor;
  final String? currencyCode;
  final int? durationMinutes;

  const ApplicationSnapshotServiceDto({
    required this.id,
    required this.name,
    required this.priceAmountMinor,
    this.currencyCode,
    this.durationMinutes,
  });

  factory ApplicationSnapshotServiceDto.fromJson(Map<String, dynamic> json) =>
      _$ApplicationSnapshotServiceDtoFromJson(json);
}
