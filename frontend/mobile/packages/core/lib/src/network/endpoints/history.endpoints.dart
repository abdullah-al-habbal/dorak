class HistoryEndpoints {
  HistoryEndpoints._();

  static const String history = '/client/history';
  static const String rebookFromHistory = '/client/history/{history}/rebook';
  static const String attachMedia = '/client/history/{history}/media';
  static const String barberClientHistory = '/barber/clients/{client}/history';
  static const String barberAttachMedia = '/barber/history/{history}/media';
}
