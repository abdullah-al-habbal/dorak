import 'package:core/core.dart';
import 'package:flutter/widgets.dart';

/// Supported UI locales and the language codes API payloads key on.
abstract final class AppLocales {
  static const englishCode = LocaleCodes.english;
  static const arabicCode = LocaleCodes.arabic;
  static const english = Locale(englishCode);
  static const arabic = Locale(arabicCode);
}
