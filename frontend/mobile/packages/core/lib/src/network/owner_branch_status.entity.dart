/// Mirrors `Modules\Branch\Enums\BranchStatusEnum`. A value this build does not know
/// becomes [unknown] instead of an error, so a newer backend never crashes the app (TD-3).
enum OwnerBranchStatus {
  pending('pending'),
  enabled('enabled'),
  disabled('disabled'),
  suspended('suspended'),
  unknown('');

  const OwnerBranchStatus(this.wire);

  final String wire;

  static OwnerBranchStatus fromWire(String? value) => values.firstWhere(
    (status) => status.wire == value && status != unknown,
    orElse: () => unknown,
  );
}
