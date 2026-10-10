import 'package:json_annotation/json_annotation.dart';

part 'review.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ReviewDto {
  final String id;
  final int rating;
  final String? comment;
  final String? authorName;
  final String? status;
  final DateTime? disputedAt;
  final DateTime? resolvedAt;
  final DateTime createdAt;

  const ReviewDto({
    required this.id,
    required this.rating,
    this.comment,
    this.authorName,
    this.status,
    this.disputedAt,
    this.resolvedAt,
    required this.createdAt,
  });

  bool get published => status == 'published';
  bool get disputed => status == 'disputed';
  bool get resolved => resolvedAt != null;
  bool get hidden => status == 'hidden';

  factory ReviewDto.fromJson(Map<String, dynamic> json) =>
      _$ReviewDtoFromJson(json);
}
