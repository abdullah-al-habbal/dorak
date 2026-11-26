import 'package:core/core.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('keeps a readable message in either language, trimmed', () {
    for (final message in [
      'The email has already been taken.',
      'البريد الإلكتروني مستخدم بالفعل.',
      'The value must be < 10.',
    ]) {
      expect(SafeServerMessage.of('  $message  '), message);
    }
  });

  final unsafe = <String, String>{
    'blank': '   ',
    'a validation key': 'validation.required',
    'a module key': 'dashboard::messages.invalid',
    'a bare namespace': 'booking::conflict',
    'markup': 'Error <script>alert(1)</script>',
    'a closing tag': 'bad </div>',
    'multiline': 'SQLSTATE[23000]\n#0 /var/www',
    'too long': 'a' * (SafeServerMessage.maxLength + 1),
  };

  for (final MapEntry(key: name, value: message) in unsafe.entries) {
    test('drops $name', () {
      expect(SafeServerMessage.of(message), isNull);
    });
  }

  ValidationException validation(Map<String, List<String>> errors) =>
      ValidationException(
        statusCode: 422,
        code: 'VALIDATION_FAILED',
        message: 'raw',
        errors: errors,
      );

  test('joins safe messages once each', () {
    final error = validation({
      'a': ['Taken.', 'validation.required'],
      'b': ['Taken.', 'Too short.'],
    });

    expect(SafeServerMessage.joined(error), 'Taken.\nToo short.');
  });

  test('has nothing to join when no message is safe', () {
    expect(
      SafeServerMessage.joined(
        validation({
          'a': ['validation.required'],
        }),
      ),
      isNull,
    );
    expect(SafeServerMessage.joined(validation({})), isNull);
  });
}
