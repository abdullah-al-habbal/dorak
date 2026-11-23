import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Review\Enums\ReviewStatus` PHP enum.
@JsonEnum()
enum ReviewStatus {
  @JsonValue('published')
  published,
  @JsonValue('disputed')
  disputed,
  @JsonValue('resolved')
  resolved,
  @JsonValue('hidden')
  hidden;

  String get value => switch (this) {
    ReviewStatus.published => 'published',
    ReviewStatus.disputed => 'disputed',
    ReviewStatus.resolved => 'resolved',
    ReviewStatus.hidden => 'hidden',
  };
}
