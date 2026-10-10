class PhoneNumber {
  PhoneNumber._();

  static String? normalize(String raw) {
    var value = raw.trim().replaceAll(RegExp(r'[\s()\-]'), '');
    if (value.startsWith('00')) value = '+${value.substring(2)}';
    if (!value.startsWith('+')) value = '+$value';
    if (!RegExp(r'^\+[1-9][0-9]{7,14}$').hasMatch(value)) return null;
    return value;
  }
}
