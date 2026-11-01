import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

const _barrel = 'endpoints.barrel.dart';
const _directory = 'lib/src/network/endpoints';
final _exportPattern = RegExp(
  r"export 'package:core/src/network/endpoints/(.+)';",
);

void main() {
  test('endpoints.barrel.dart exports every endpoint file exactly once', () {
    final files =
        Directory(_directory)
            .listSync()
            .whereType<File>()
            .map((file) => file.uri.pathSegments.last)
            .where((name) => name.endsWith('.dart') && name != _barrel)
            .toList()
          ..sort();
    final exported = _exportPattern
        .allMatches(File('$_directory/$_barrel').readAsStringSync())
        .map((match) => match.group(1)!)
        .toList();

    expect(exported.toSet().length, exported.length, reason: 'no duplicates');
    expect(exported.toList()..sort(), files);
  });

  test(
    'network.barrel.dart reaches endpoints only through the endpoints barrel',
    () {
      final exports = _exportPattern
          .allMatches(
            File('lib/src/network/network.barrel.dart').readAsStringSync(),
          )
          .map((match) => match.group(1)!)
          .toList();

      expect(exports, [_barrel]);
    },
  );
}
