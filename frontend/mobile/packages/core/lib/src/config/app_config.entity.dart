class AppConfig {
  const AppConfig({
    required this.apiBaseUrl,
    required this.apiBaseV1Url,
    required this.reverbAppKey,
    required this.reverbHost,
    required this.reverbPort,
    required this.reverbScheme,
    required this.reverbServerPath,
  });

  final String apiBaseUrl;
  final String apiBaseV1Url;
  final String reverbAppKey;
  final String reverbHost;
  final int reverbPort;
  final String reverbScheme;
  final String reverbServerPath;
}
