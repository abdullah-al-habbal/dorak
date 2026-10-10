import 'package:flutter_test/flutter_test.dart';

import 'package:business_app/src/features/barbers/phone_number.entity.dart';

void main() {
  test('normalizes spaces, punctuation, and international 00 prefix', () {
    expect(PhoneNumber.normalize('00 963 (944)-123-456'), '+963944123456');
  });

  test('rejects a number without a valid E.164 country code', () {
    expect(PhoneNumber.normalize('0944 123 456'), isNull);
  });
}
