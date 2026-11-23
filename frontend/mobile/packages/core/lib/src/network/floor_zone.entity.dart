/// Mirrors `Modules\Chair\Enums\FloorZone`. The DTO keeps the raw string so a zone this
/// build does not know still groups its chairs; compare against [wire] and use
/// [fromWire] to label a zone.
enum FloorZone {
  men('men'),
  women('women'),
  shared('shared');

  const FloorZone(this.wire);

  final String wire;

  /// The zone for [value], or `null` for one this build does not know.
  static FloorZone? fromWire(String? value) {
    for (final zone in values) {
      if (zone.wire == value) return zone;
    }
    return null;
  }
}
