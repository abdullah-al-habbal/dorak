import 'package:json_annotation/json_annotation.dart';

part 'application_snapshot_rating.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ApplicationSnapshotRatingDto {
  final double? average;
  final int count;

  const ApplicationSnapshotRatingDto({this.average, this.count = 0});

  factory ApplicationSnapshotRatingDto.fromJson(Map<String, dynamic> json) =>
      _$ApplicationSnapshotRatingDtoFromJson(json);
}
