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

  static ReviewSubjectType fromValue(String value) => switch (value) {
    'branch' => ReviewSubjectType.branch,
    'barber' => ReviewSubjectType.barber,
    'client' => ReviewSubjectType.client,
    _ => throw ArgumentError('Unknown review subject type: $value'),
  };

  String get value => switch (this) {
    ReviewSubjectType.branch => 'branch',
    ReviewSubjectType.barber => 'barber',
    ReviewSubjectType.client => 'client',
  };
}
