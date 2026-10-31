/// Limits and polling cadence of the face analysis flow.
class FaceAnalysisConstants {
  const FaceAnalysisConstants._();

  static const int maxPhotos = 5;
  static const int maxCatalogPages = 5;
  static const List<Duration> analysisPollDelays = [
    Duration(seconds: 1),
    Duration(seconds: 2),
    Duration(seconds: 4),
  ];
}
