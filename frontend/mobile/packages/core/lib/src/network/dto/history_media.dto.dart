import 'package:json_annotation/json_annotation.dart';

part 'history_media.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class HistoryMediaDto {
  final String id;
  final String photoUrl;
  final String? photoType;
  final DateTime? uploadedAt;

  const HistoryMediaDto({
    required this.id,
    required this.photoUrl,
    this.photoType,
    this.uploadedAt,
  });

  factory HistoryMediaDto.fromJson(Map<String, dynamic> json) =>
      _$HistoryMediaDtoFromJson(json);
}
