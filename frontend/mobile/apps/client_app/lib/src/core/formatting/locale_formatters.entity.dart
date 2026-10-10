import 'package:intl/intl.dart';

/// Reuses locale-specific formatters so widget rebuilds only format values.
abstract final class LocaleFormatters {
  static final Map<String, DateFormat> _dateTimeFormatters = {};
  static final Map<String, DateFormat> _timeFormatters = {};
  static final Map<String, NumberFormat> _decimalFormatters = {};

  static String dateTime(DateTime value, String localeCode) =>
      _dateTimeFormatters
          .putIfAbsent(localeCode, () => DateFormat.yMMMd(localeCode).add_Hm())
          .format(value);

  static String time(DateTime value, String localeCode) => _timeFormatters
      .putIfAbsent(localeCode, () => DateFormat.Hm(localeCode))
      .format(value);

  static String decimal(num value, String localeCode) => _decimalFormatters
      .putIfAbsent(localeCode, () => NumberFormat.decimalPattern(localeCode))
      .format(value);
}
