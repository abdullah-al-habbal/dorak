import 'package:core/src/network/dto/application_profile_snapshot.dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'job_application.dto.g.dart';

/// [status] is one of `submitted`, `seen`, `accepted`, `rejected` (Task 56).
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
  final String status;
  final ApplicationProfileSnapshotDto? profileSnapshot;
  factory JobApplicationDto.fromJson(Map<String, dynamic> json) =>
      _$JobApplicationDtoFromJson(json);
}
