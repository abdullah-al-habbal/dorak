import 'package:core/core.dart';

/// Seam over the social sign-in SDKs so blocs and tests never touch
/// the platform. `obtainToken` returns the token `POST /client/social/{provider}`
/// expects, or `null` when the user dismissed the sheet.
abstract class SocialCredentialProvider {
  bool supports(SocialAuthProvider provider);

  Future<String?> obtainToken(SocialAuthProvider provider);
}
