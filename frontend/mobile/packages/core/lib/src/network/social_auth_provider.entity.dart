/// Social login providers accepted by `POST /client/social/{provider}`.
enum SocialAuthProvider {
  google;

  String get value => switch (this) {
    SocialAuthProvider.google => 'google',
  };
}
