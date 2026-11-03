/// The editable fields of a service, as typed in the form.
class BusinessServiceDraft {
  const BusinessServiceDraft({
    required this.nameEn,
    required this.nameAr,
    required this.price,
    required this.currencyCode,
    required this.durationMinutes,
    this.isAtHome = false,
    this.isActive = true,
  });

  final String nameEn;
  final String nameAr;
  final double price;
  final String currencyCode;
  final int durationMinutes;
  final bool isAtHome;
  final bool isActive;
}
