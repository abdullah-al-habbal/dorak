import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Review\Enums\ReviewStatus` PHP enum.
enum ReviewStatus {
  @JsonValue('published')
  published,
  @JsonValue('disputed')
  disputed,
  @JsonValue('resolved')
  resolved,
  @JsonValue('hidden')
  hidden;

  static ReviewStatus fromValue(String value) => switch (value) {
    'published' => ReviewStatus.published,
    'disputed' => ReviewStatus.disputed,
    'resolved' => ReviewStatus.resolved,
    'hidden' => ReviewStatus.hidden,
    _ => throw ArgumentError('Unknown review status: $value'),
  };

  String get value => switch (this) {
    ReviewStatus.published => 'published',
    ReviewStatus.disputed => 'disputed',
    ReviewStatus.resolved => 'resolved',
    ReviewStatus.hidden => 'hidden',
  };
}
