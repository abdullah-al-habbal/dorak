/// The backend sends a translatable field as `{en, ar}`, or as one string once it
/// has been resolved to the request locale. Both become a map (`{'': text}` for a
/// plain string), so `LocalizedName.resolve` works on either.
Map<String, String> localizedMapFromJson(Object? value) {
  if (value is Map) {
    return {
      for (final entry in value.entries)
        if (entry.value is String) entry.key.toString(): entry.value as String,
    };
  }
  if (value is String) {
    return {'en': value, 'ar': value};
  }
  return const {};
}
