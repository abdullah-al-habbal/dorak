/// Mirrors `Modules\BarberAffiliation\Enums\AffiliationStatusEnum`. A value this build
/// does not know becomes [unknown] instead of an error (TD-3).
enum BarberAffiliationStatus {
  pending('pending'),
  active('active'),
  rejected('rejected'),
  terminated('terminated'),
  unknown('');

  const BarberAffiliationStatus(this.wire);

  final String wire;

  static BarberAffiliationStatus fromWire(String? value) => values.firstWhere(
    (status) => status.wire == value && status != unknown,
    orElse: () => unknown,
  );
}
