import 'package:core/src/network/dto/application_profile_snapshot.dto.dart';
import 'package:core/src/network/job_application_status.entity.dart';
import 'package:json_annotation/json_annotation.dart';

part 'job_application.dto.g.dart';

JobApplicationStatus _statusFromJson(Object? value) =>
    JobApplicationStatus.fromWire(value is String ? value : null);

/// [status] decodes to [JobApplicationStatus]; anything else reads as `unknown` (Task 56).
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class JobApplicationDto {
  const JobApplicationDto({
    required this.id,
    required this.jobPostingId,
    required this.barberId,
    required this.status,
    this.profileSnapshot,
  });
  final String id;
  final String jobPostingId;
  final String barberId;
  @JsonKey(fromJson: _statusFromJson)
  final JobApplicationStatus status;
  final ApplicationProfileSnapshotDto? profileSnapshot;
  factory JobApplicationDto.fromJson(Map<String, dynamic> json) =>
      _$JobApplicationDtoFromJson(json);
}
