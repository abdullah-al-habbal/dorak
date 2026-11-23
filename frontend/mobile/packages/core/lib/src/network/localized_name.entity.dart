import 'package:core/src/network/locale_codes.entity.dart';

abstract final class LocalizedName {
  static String resolve(Map<String, String> names, String localeCode) =>
      names[localeCode] ?? names[LocaleCodes.english] ?? '';
}
