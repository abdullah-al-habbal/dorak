import 'package:url_launcher/url_launcher.dart';

/// Opens a link outside the app. A seam so screens and tests never touch the plugin.
abstract class ExternalLinkOpener {
  /// Returns false when no handler could open [uri].
  Future<bool> open(Uri uri);
}

class UrlLauncherExternalLinkOpener implements ExternalLinkOpener {
  const UrlLauncherExternalLinkOpener();

  @override
  Future<bool> open(Uri uri) async {
    if (uri.scheme != 'https' && uri.scheme != 'http') {
      return false;
    }
    try {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    } on Object {
      return false;
    }
  }
}
