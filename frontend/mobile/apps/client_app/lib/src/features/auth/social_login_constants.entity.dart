/// Keys and scopes for the Google and Apple sign-in SDKs.
class SocialLoginConstants {
  const SocialLoginConstants._();

  static const String googleClientIdKey = 'GOOGLE_CLIENT_ID';
  static const String googleServerClientIdKey = 'GOOGLE_SERVER_CLIENT_ID';
  static const List<String> googleScopes = ['email', 'profile'];
}
