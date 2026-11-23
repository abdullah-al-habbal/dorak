import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Branch\Enums\BranchHoursSource` PHP enum.
enum BranchHoursSource {
  @JsonValue('weekly')
  weekly,
  @JsonValue('override')
  override;

  String get value => switch (this) {
    BranchHoursSource.weekly => 'weekly',
    BranchHoursSource.override => 'override',
  };
}
