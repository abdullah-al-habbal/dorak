import 'package:json_annotation/json_annotation.dart';

part 'job_posting.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class JobPostingDto {
  const JobPostingDto({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.branchId,
    this.applicationsCount,
    this.location,
    this.employmentType,
  });
  final String id;
  final Map<String, dynamic> title;
  final Map<String, dynamic> description;
  final String status;
  final String branchId;
  final int? applicationsCount;
  final String? location;
  final String? employmentType;
  factory JobPostingDto.fromJson(Map<String, dynamic> json) =>
      _$JobPostingDtoFromJson(json);
}
