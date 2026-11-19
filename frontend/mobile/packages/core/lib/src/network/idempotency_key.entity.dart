import 'dart:math';

/// A random version 4 UUID, sent as the `Idempotency-Key` of one submission.
abstract final class IdempotencyKey {
  static const int _byteCount = 16;
  static const int _byteRange = 256;
  static const int _versionByteIndex = 6;
  static const int _variantByteIndex = 8;
  static const int _versionMask = 0x0f;
  static const int _versionFour = 0x40;
  static const int _variantMask = 0x3f;
  static const int _variantRfc4122 = 0x80;
  static const List<int> _hyphenAfterByte = [4, 6, 8, 10];

  static final Random _secureRandom = Random.secure();

  static String generate([Random? random]) {
    final source = random ?? _secureRandom;
    final bytes = List<int>.generate(
      _byteCount,
      (_) => source.nextInt(_byteRange),
    );
    bytes[_versionByteIndex] =
        (bytes[_versionByteIndex] & _versionMask) | _versionFour;
    bytes[_variantByteIndex] =
        (bytes[_variantByteIndex] & _variantMask) | _variantRfc4122;

    final buffer = StringBuffer();
    for (var index = 0; index < bytes.length; index++) {
      if (_hyphenAfterByte.contains(index)) buffer.write('-');
      buffer.write(bytes[index].toRadixString(16).padLeft(2, '0'));
    }
    return buffer.toString();
  }
}
