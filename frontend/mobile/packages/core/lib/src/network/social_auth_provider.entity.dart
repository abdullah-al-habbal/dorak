/// Social login providers accepted by `POST /client/social/{provider}`.
enum SocialAuthProvider {
  google,
  apple;

  String get value => switch (this) {
    SocialAuthProvider.google => 'google',
    SocialAuthProvider.apple => 'apple',
  };
}
