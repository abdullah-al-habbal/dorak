class BookingStatusTransitions {
  static const Map<String, List<String>> allowedTargets = {
    'pending': ['confirmed', 'canceled'],
    'confirmed': ['in_progress', 'canceled', 'no_show'],
    'in_progress': ['completed', 'canceled', 'no_show'],
    'completed': [],
    'canceled': [],
    'no_show': [],
  };

  static List<String> from(String currentStatus) =>
      allowedTargets[currentStatus] ?? const [];
}
