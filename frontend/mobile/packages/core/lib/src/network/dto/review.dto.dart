import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/review_status.entity.dart';

part 'review.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ReviewDto {
  final String id;
  final String? subjectType;
  final String? subjectId;
  final int rating;
  final String? comment;
  final String? authorName;
  final ReviewStatus? status;
  final DateTime? disputedAt;
  final DateTime? resolvedAt;
  final DateTime createdAt;

  const ReviewDto({
    required this.id,
    this.subjectType,
    this.subjectId,
    required this.rating,
    this.comment,
    this.authorName,
    this.status,
    this.disputedAt,
    this.resolvedAt,
    required this.createdAt,
  });

  bool get isBarberReview => subjectType == 'barber';
  bool get isBranchReview => subjectType == 'branch';

  bool get published => status == ReviewStatus.published;
  bool get disputed => status == ReviewStatus.disputed;
  bool get resolved => resolvedAt != null;
  bool get hidden => status == ReviewStatus.hidden;

  factory ReviewDto.fromJson(Map<String, dynamic> json) =>
      _$ReviewDtoFromJson(json);
}
