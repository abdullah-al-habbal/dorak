/// Mirrors `Modules\JobPosting\Enums\ApplicationStatus`. A value this build does not
/// know becomes [unknown] instead of an error (TD-3).
enum JobApplicationStatus {
  submitted('submitted'),
  seen('seen'),
  accepted('accepted'),
  rejected('rejected'),
  unknown('');

  const JobApplicationStatus(this.wire);

  final String wire;

  static JobApplicationStatus fromWire(String? value) => values.firstWhere(
    (status) => status.wire == value && status != unknown,
    orElse: () => unknown,
  );

  /// The employer has accepted or rejected the application; it can no longer change.
  bool get isDecided => this == accepted || this == rejected;
}
