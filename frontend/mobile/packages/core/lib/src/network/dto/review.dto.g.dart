// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'review.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ReviewDto _$ReviewDtoFromJson(Map<String, dynamic> json) => ReviewDto(
  id: json['id'] as String,
  subjectType: $enumDecodeNullable(
    _$ReviewSubjectTypeEnumMap,
    json['subject_type'],
    unknownValue: JsonKey.nullForUndefinedEnumValue,
  ),
  subjectId: json['subject_id'] as String?,
  rating: (json['rating'] as num).toInt(),
  comment: json['comment'] as String?,
  authorName: json['author_name'] as String?,
  status: $enumDecodeNullable(
    _$ReviewStatusEnumMap,
    json['status'],
    unknownValue: JsonKey.nullForUndefinedEnumValue,
  ),
  disputedAt: json['disputed_at'] == null
      ? null
      : DateTime.parse(json['disputed_at'] as String),
  resolvedAt: json['resolved_at'] == null
      ? null
      : DateTime.parse(json['resolved_at'] as String),
  createdAt: DateTime.parse(json['created_at'] as String),
);

const _$ReviewSubjectTypeEnumMap = {
  ReviewSubjectType.branch: 'branch',
  ReviewSubjectType.barber: 'barber',
  ReviewSubjectType.client: 'client',
};

const _$ReviewStatusEnumMap = {
  ReviewStatus.published: 'published',
  ReviewStatus.disputed: 'disputed',
  ReviewStatus.resolved: 'resolved',
  ReviewStatus.hidden: 'hidden',
};
