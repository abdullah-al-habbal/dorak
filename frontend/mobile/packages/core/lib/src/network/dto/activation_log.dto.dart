import 'package:json_annotation/json_annotation.dart';

part 'activation_log.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ActivationLogDto {
  final String id;
  final String activableId;
  final String activableType;
  final String status;
  final String? reason;

  const ActivationLogDto({
    required this.id,
    required this.activableId,
    required this.activableType,
    required this.status,
    this.reason,
  });

  factory ActivationLogDto.fromJson(Map<String, dynamic> json) =>
      _$ActivationLogDtoFromJson(json);
}
