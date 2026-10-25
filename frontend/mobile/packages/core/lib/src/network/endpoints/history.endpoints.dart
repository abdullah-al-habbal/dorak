class HistoryEndpoints {
  HistoryEndpoints._();

  static const String history = '/client/history';
  static const String updateEntry = '/client/history/{history}';
  static const String rebookFromHistory = '/client/history/{history}/rebook';
  static const String attachMedia = '/client/history/{history}/media';
}
