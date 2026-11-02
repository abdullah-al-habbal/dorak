import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/review_status.entity.dart';
import 'package:core/src/network/review_subject_type.entity.dart';

part 'review.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ReviewDto {
  final String id;
  @JsonKey(unknownEnumValue: JsonKey.nullForUndefinedEnumValue)
  final ReviewSubjectType? subjectType;
  final String? subjectId;
  final int rating;
  final String? body;
  final String? authorName;
  @JsonKey(unknownEnumValue: JsonKey.nullForUndefinedEnumValue)
  final ReviewStatus? status;
  final DateTime? disputedAt;
  final DateTime? resolvedAt;
  final DateTime createdAt;

  const ReviewDto({
    required this.id,
    this.subjectType,
    this.subjectId,
    required this.rating,
    this.body,
    this.authorName,
    this.status,
    this.disputedAt,
    this.resolvedAt,
    required this.createdAt,
  });

  bool get isBarberReview => subjectType == ReviewSubjectType.barber;
  bool get isBranchReview => subjectType == ReviewSubjectType.branch;

  bool get published => status == ReviewStatus.published;
  bool get disputed => status == ReviewStatus.disputed;
  bool get resolved => resolvedAt != null;
  bool get hidden => status == ReviewStatus.hidden;

  factory ReviewDto.fromJson(Map<String, dynamic> json) =>
      _$ReviewDtoFromJson(json);
}
