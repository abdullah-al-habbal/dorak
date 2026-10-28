import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('stylist code never changes an application status', () {
    final offenders = Directory('lib')
        .listSync(recursive: true)
        .whereType<File>()
        .where(
          (file) =>
              file.readAsStringSync().contains('updateBranchApplicationStatus') ||
              file.readAsStringSync().contains('/status'),
        )
        .map((file) => file.path);

    expect(offenders, isEmpty);
  });
}
