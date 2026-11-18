/// Mirrors `Modules\Brand\Enums\BrandStatusEnum`. A value this build does not know
/// becomes [unknown] instead of an error, so a newer backend never crashes the app (TD-3).
enum OwnerBrandStatus {
  pending('pending'),
  active('active'),
  rejected('rejected'),
  suspended('suspended'),
  unknown('');

  const OwnerBrandStatus(this.wire);

  final String wire;

  static OwnerBrandStatus fromWire(String? value) => values.firstWhere(
    (status) => status.wire == value && status != unknown,
    orElse: () => unknown,
  );

  /// Only an active brand gets every feature; a pending one has the D11 limits.
  bool get isActive => this == active;

  /// A suspended brand is read-only.
  bool get isReadOnly => this == suspended;
}
