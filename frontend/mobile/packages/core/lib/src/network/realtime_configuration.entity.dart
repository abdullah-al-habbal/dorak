class RealtimeConfiguration {
  const RealtimeConfiguration({
    required this.appKey,
    required this.host,
    required this.port,
    required this.useTls,
    required this.authEndpoint,
    this.serverPath = '',
  });

  final String appKey;
  final String host;
  final int port;
  final bool useTls;
  final String authEndpoint;
  final String serverPath;
}
