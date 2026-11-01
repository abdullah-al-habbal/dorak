import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Branch\Enums\BranchHoursSource` PHP enum.
enum BranchHoursSource {
  @JsonValue('weekly')
  weekly,
  @JsonValue('override')
  override;

  static BranchHoursSource fromValue(String value) => switch (value) {
    'weekly' => BranchHoursSource.weekly,
    'override' => BranchHoursSource.override,
    _ => throw ArgumentError('Unknown branch hours source: $value'),
  };

  String get value => switch (this) {
    BranchHoursSource.weekly => 'weekly',
    BranchHoursSource.override => 'override',
  };
}
