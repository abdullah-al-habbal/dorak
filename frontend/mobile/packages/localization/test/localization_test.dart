import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

Map<String, String> _messages(String locale) {
  final json =
      jsonDecode(File('l10n/app_$locale.arb').readAsStringSync())
          as Map<String, dynamic>;
  return {
    for (final entry in json.entries)
      if (!entry.key.startsWith('@') && entry.value is String)
        entry.key: entry.value as String,
  };
}

Set<String> _placeholders(String text) => RegExp(
  r'\{(\w+)\}',
).allMatches(text).map((match) => match.group(1)!).toSet();

void main() {
  final english = _messages('en');
  final arabic = _messages('ar');

  test('English and Arabic define the same message keys', () {
    expect(arabic.keys.toSet().difference(english.keys.toSet()), isEmpty);
    expect(english.keys.toSet().difference(arabic.keys.toSet()), isEmpty);
  });

  test('no message is empty', () {
    expect(
      [
        ...english.entries,
        ...arabic.entries,
      ].where((entry) => entry.value.trim().isEmpty),
      isEmpty,
    );
  });

  test('Arabic never uses a {placeholder} the English message lacks', () {
    final mismatched = [
      for (final entry in arabic.entries)
        if (english.containsKey(entry.key) &&
            _placeholders(
              entry.value,
            ).difference(_placeholders(english[entry.key]!)).isNotEmpty)
          entry.key,
    ];

    expect(mismatched, isEmpty);
  });

  for (final locale in ['en', 'ar']) {
    test('app_$locale.arb declares every top-level key once', () {
      // jsonDecode keeps the last duplicate silently, so count the raw keys.
      final keys = RegExp(
        r'^  "([^"]+)":',
        multiLine: true,
      ).allMatches(File('l10n/app_$locale.arb').readAsStringSync());
      final seen = <String>{};
      final duplicates = [
        for (final match in keys)
          if (!seen.add(match.group(1)!)) match.group(1)!,
      ];
      expect(duplicates, isEmpty);
    });
  }

  test('Arabic calls the stylist "المصفف", never "الحلاق" (terminology)', () {
    // "الحلاقة" (the trade) stays allowed; the person is always a stylist.
    final barberWord = RegExp('حلاق(?!ة)');
    expect(
      arabic.entries
          .where((entry) => barberWord.hasMatch(entry.value))
          .map((entry) => entry.key),
      isEmpty,
    );
  });
}
