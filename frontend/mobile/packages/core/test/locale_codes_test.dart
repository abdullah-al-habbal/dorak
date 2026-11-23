import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('the locale codes are the keys the backend localized payloads use', () {
    expect(LocaleCodes.english, 'en');
    expect(LocaleCodes.arabic, 'ar');
  });
}
