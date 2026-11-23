import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('floor zones keep the wire values of the backend FloorZone enum', () {
    expect(FloorZone.values.map((zone) => zone.wire), [
      'men',
      'women',
      'shared',
    ]);
  });

  test('an unknown or missing zone is null instead of an error', () {
    expect(FloorZone.fromWire('vip'), isNull);
    expect(FloorZone.fromWire(null), isNull);
    expect(FloorZone.fromWire('women'), FloorZone.women);
  });

  test(
    'the client universe values match the discovery default and segments',
    () {
      expect(ClientUniverse.men.value, 'men');
      expect(ClientUniverse.women.value, 'women');
    },
  );
}
