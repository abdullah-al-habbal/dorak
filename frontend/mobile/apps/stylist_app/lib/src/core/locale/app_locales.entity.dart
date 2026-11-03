import 'package:flutter/widgets.dart';

/// Supported UI locales and the language codes API payloads key on.
abstract final class AppLocales {
  static const englishCode = 'en';
  static const arabicCode = 'ar';
  static const english = Locale(englishCode);
  static const arabic = Locale(arabicCode);
}
