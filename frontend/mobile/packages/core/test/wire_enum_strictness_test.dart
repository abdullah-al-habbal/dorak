import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('no wire enum decodes an unexpected value by throwing', () {
    final throwing = Directory('lib/src/network')
        .listSync()
        .whereType<File>()
        .where((file) => file.path.endsWith('.entity.dart'))
        .where(
          (file) => file.readAsStringSync().contains('throw ArgumentError'),
        )
        .map((file) => file.path)
        .toList();

    expect(throwing, isEmpty);
  });
}
