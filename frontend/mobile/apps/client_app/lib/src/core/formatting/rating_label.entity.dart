import 'package:intl/intl.dart';
import 'package:localization/localization.dart';

abstract final class RatingLabel {
  static final Map<String, NumberFormat> _formatters = {};

  static String of(
    AppLocalizations l10n, {
    required double? average,
    required int count,
    required String localeCode,
  }) {
    if (average == null || count == 0) return l10n.ratingNoReviews;
    final rating = _formatters
        .putIfAbsent(localeCode, () => NumberFormat('0.0', localeCode))
        .format(average);
    return l10n.ratingSummary(rating, count);
  }
}
