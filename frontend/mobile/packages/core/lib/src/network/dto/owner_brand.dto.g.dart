// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'owner_brand.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OwnerBrandDto _$OwnerBrandDtoFromJson(Map<String, dynamic> json) =>
    OwnerBrandDto(
      id: json['id'] as String,
      name: localizedMapFromJson(json['name']),
      status: _statusFromJson(json['status']),
      description: json['description'] == null
          ? const {}
          : localizedMapFromJson(json['description']),
      logoUrl: json['logo_url'] as String?,
      slug: json['slug'] as String?,
      universe: json['universe'] as String?,
      statusReason: json['status_reason'] as String?,
      submissionCount: (json['submission_count'] as num?)?.toInt() ?? 1,
      maxSubmissions: (json['max_submissions'] as num?)?.toInt() ?? 1,
      branchesCount: (json['branches_count'] as num?)?.toInt(),
      features:
          (json['features'] as Map<String, dynamic>?)?.map(
            (k, e) => MapEntry(k, e as bool),
          ) ??
          {},
    );
