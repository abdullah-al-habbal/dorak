import 'package:json_annotation/json_annotation.dart';

part 'job_application.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class JobApplicationDto {
  const JobApplicationDto({
    required this.id,
    required this.jobPostingId,
    required this.barberId,
    required this.status,
  });
  final String id;
  final String jobPostingId;
  final String barberId;
  final String status;
  factory JobApplicationDto.fromJson(Map<String, dynamic> json) =>
      _$JobApplicationDtoFromJson(json);
}
