import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Branch\Enums\BranchStatusEnum` PHP enum.
enum BranchStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('enabled')
  enabled,
  @JsonValue('disabled')
  disabled;

  static BranchStatus fromValue(String value) => switch (value) {
    'pending' => BranchStatus.pending,
    'enabled' => BranchStatus.enabled,
    'disabled' => BranchStatus.disabled,
    _ => throw ArgumentError('Unknown BranchStatus: $value'),
  };

  String get value => switch (this) {
    BranchStatus.pending => 'pending',
    BranchStatus.enabled => 'enabled',
    BranchStatus.disabled => 'disabled',
  };
}
