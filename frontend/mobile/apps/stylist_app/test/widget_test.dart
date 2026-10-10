import 'package:flutter_test/flutter_test.dart';

import 'package:stylist_app/src/features/operations/stylist.state.dart';

void main() {
  test('starts offline with no appointments', () {
    final state = StylistState();

    expect(state.loading, isFalse);
    expect(state.online, isFalse);
    expect(state.appointments, isEmpty);
    expect(state.error, isNull);
  });
}
