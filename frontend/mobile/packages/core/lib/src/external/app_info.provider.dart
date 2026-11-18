import 'package:package_info_plus/package_info_plus.dart';

/// The installed app's version, sent with feedback as `app_version`.
abstract class AppInfoProvider {
  /// For example `1.4.2+17`; empty when the platform cannot say.
  Future<String> version();
}

class PackageInfoAppInfoProvider implements AppInfoProvider {
  const PackageInfoAppInfoProvider();

  @override
  Future<String> version() async {
    try {
      final info = await PackageInfo.fromPlatform();
      return info.buildNumber.isEmpty
          ? info.version
          : '${info.version}+${info.buildNumber}';
    } on Object {
      return '';
    }
  }
}
