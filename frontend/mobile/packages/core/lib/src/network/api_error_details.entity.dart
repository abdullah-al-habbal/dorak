class ApiErrorDetails {
  const ApiErrorDetails({this.fields = const {}});

  final Map<String, List<String>> fields;

  factory ApiErrorDetails.fromJson(Object? value) {
    if (value is! Map) return const ApiErrorDetails();
    return ApiErrorDetails(
      fields: Map.unmodifiable(
        value.map(
          (key, fieldValue) => MapEntry(
            key.toString(),
            fieldValue is List
                ? fieldValue.map((item) => item.toString()).toList()
                : [fieldValue.toString()],
          ),
        ),
      ),
    );
  }

  List<String>? forField(String field) => fields[field];
}
