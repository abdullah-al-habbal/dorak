import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\Branch\Enums\BranchStatusEnum` PHP enum.
enum BranchStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('enabled')
  enabled,
  @JsonValue('disabled')
  disabled,
  @JsonValue('suspended')
  suspended;

  String get value => switch (this) {
    BranchStatus.pending => 'pending',
    BranchStatus.enabled => 'enabled',
    BranchStatus.disabled => 'disabled',
    BranchStatus.suspended => 'suspended',
  };
}
