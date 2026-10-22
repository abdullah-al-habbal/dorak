import 'package:json_annotation/json_annotation.dart';

part 'notification.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class NotificationDto {
  final String id;
  final String type;
  final String title;
  final String body;
  final Map<String, dynamic> data;
  final DateTime? readAt;
  final DateTime? createdAt;

  const NotificationDto({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.data = const {},
    this.readAt,
    this.createdAt,
  });

  bool get isUnread => readAt == null;

  factory NotificationDto.fromJson(Map<String, dynamic> json) =>
      _$NotificationDtoFromJson(json);
}
