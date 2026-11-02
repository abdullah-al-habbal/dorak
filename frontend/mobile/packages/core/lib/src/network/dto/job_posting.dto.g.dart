// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'job_posting.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

JobPostingDto _$JobPostingDtoFromJson(Map<String, dynamic> json) =>
    JobPostingDto(
      id: json['id'] as String,
      title: json['title'] as Map<String, dynamic>,
      description: json['description'] as Map<String, dynamic>,
      status: json['status'] as String,
      branchId: json['branch_id'] as String,
      applicationsCount: (json['applications_count'] as num?)?.toInt(),
      location: json['location'] as String?,
      employmentType: json['employment_type'] as String?,
    );
