import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Review\Enums\ReviewSubjectTypeEnum` PHP enum.
@JsonEnum()
enum ReviewSubjectType {
  @JsonValue('branch')
  branch,
  @JsonValue('barber')
  barber,
  @JsonValue('client')
  client;

  String get value => switch (this) {
    ReviewSubjectType.branch => 'branch',
    ReviewSubjectType.barber => 'barber',
    ReviewSubjectType.client => 'client',
  };
}
