/// Converts between the integer minor units the API stores money in and the
/// major-unit decimals the UI edits and displays.
abstract final class MinorUnits {
  static const int perMajor = 100;

  static double toMajor(int amountMinor) => amountMinor / perMajor;

  static double? toMajorOrNull(int? amountMinor) =>
      amountMinor == null ? null : toMajor(amountMinor);

  static int fromMajor(num amountMajor) => (amountMajor * perMajor).round();
}
