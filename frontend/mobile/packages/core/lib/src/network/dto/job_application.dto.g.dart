// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'job_application.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

JobApplicationDto _$JobApplicationDtoFromJson(Map<String, dynamic> json) =>
    JobApplicationDto(
      id: json['id'] as String,
      jobPostingId: json['job_posting_id'] as String,
      barberId: json['barber_id'] as String,
      status: _statusFromJson(json['status']),
      profileSnapshot: json['profile_snapshot'] == null
          ? null
          : ApplicationProfileSnapshotDto.fromJson(
              json['profile_snapshot'] as Map<String, dynamic>,
            ),
    );
