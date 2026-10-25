abstract final class LocalizedName {
  static String resolve(Map<String, String> names, String localeCode) =>
      names[localeCode] ?? names['en'] ?? '';
}
