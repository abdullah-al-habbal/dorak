import 'package:json_annotation/json_annotation.dart';

part 'submit_review.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class SubmitReviewDto {
  final int rating;
  final String? body;

  const SubmitReviewDto({required this.rating, this.body});

  factory SubmitReviewDto.fromJson(Map<String, dynamic> json) =>
      _$SubmitReviewDtoFromJson(json);
}
