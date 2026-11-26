import 'package:core/core.dart';

/// Decides which server validation messages may be shown. The server localizes
/// them (`Accept-Language`); `ApiException.message` is never shown.
abstract final class SafeServerMessage {
  static const int maxLength = 200;

  /// `validation.required` or `module::file.key`: an untranslated key.
  static final RegExp _translationKey = RegExp(
    r'^(\S*::\S*|[a-z0-9_-]+(\.[a-z0-9_-]+)+)$',
  );
  static final RegExp _markup = RegExp('<[a-zA-Z/!?]');
  static final RegExp _controlCharacter = RegExp(r'[\x00-\x1F\x7F]');

  /// The trimmed message, or null when it is not fit to show.
  static String? of(String message) {
    final text = message.trim();
    if (text.isEmpty || text.length > maxLength) return null;
    if (_translationKey.hasMatch(text)) return null;
    if (_markup.hasMatch(text) || _controlCharacter.hasMatch(text)) return null;
    return text;
  }

  static List<String> allOf(Iterable<String> messages) => [
    for (final message in messages) ?of(message),
  ];

  /// Every safe field message, once each, one per line; null when there is none.
  static String? joined(ValidationException error) {
    final messages = allOf(error.errors.values.expand((list) => list)).toSet();
    return messages.isEmpty ? null : messages.join('\n');
  }
}
