import 'package:json_annotation/json_annotation.dart';

part 'application_snapshot_photo.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ApplicationSnapshotPhotoDto {
  final String id;
  final String url;

  const ApplicationSnapshotPhotoDto({required this.id, required this.url});

  factory ApplicationSnapshotPhotoDto.fromJson(Map<String, dynamic> json) =>
      _$ApplicationSnapshotPhotoDtoFromJson(json);
}
