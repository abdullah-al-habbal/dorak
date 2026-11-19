import 'dart:math';

import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('IdempotencyKey', () {
    test('is a version 4 UUID the server accepts as a key', () {
      final key = IdempotencyKey.generate(Random(7));

      expect(
        key,
        matches(
          RegExp(
            r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
          ),
        ),
      );
      // The backend accepts 8 to 64 characters of letters, digits and . _ : -
      expect(key.length, inInclusiveRange(8, 64));
      expect(key, matches(RegExp(r'^[A-Za-z0-9._:-]+$')));
    });

    test('differs between calls', () {
      final keys = {for (var i = 0; i < 50; i++) IdempotencyKey.generate()};

      expect(keys, hasLength(50));
    });
  });
}
