// GENERATED CODE - DO NOT MODIFY BY HAND
part of 'job_posting.dto.dart';

JobPostingDto _$JobPostingDtoFromJson(Map<String, dynamic> json) =>
    JobPostingDto(
      id: json['id'] as String,
      title: Map<String, dynamic>.from(json['title'] as Map),
      description: Map<String, dynamic>.from(json['description'] as Map),
      status: json['status'] as String,
      branchId: json['branch_id'] as String,
      applicationsCount: (json['applications_count'] as num?)?.toInt(),
    );
