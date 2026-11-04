import 'dart:io';

import 'package:core/core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'package:client_app/src/features/auth/social_credential.provider.dart';
import 'package:client_app/src/features/auth/social_login_constants.entity.dart';

class PlatformSocialCredentialProvider implements SocialCredentialProvider {
  PlatformSocialCredentialProvider();

  Future<void>? _googleInitialization;

  @override
  bool supports(SocialAuthProvider provider) => switch (provider) {
    SocialAuthProvider.google => Platform.isAndroid || Platform.isIOS,
  };

  @override
  Future<String?> obtainToken(SocialAuthProvider provider) =>
      switch (provider) {
        SocialAuthProvider.google => _googleAccessToken(),
      };

  Future<String?> _googleAccessToken() async {
    final google = GoogleSignIn.instance;
    await (_googleInitialization ??= google.initialize(
      clientId: dotenv.maybeGet(SocialLoginConstants.googleClientIdKey),
      serverClientId: dotenv.maybeGet(
        SocialLoginConstants.googleServerClientIdKey,
      ),
    ));
    try {
      final account = await google.authenticate(
        scopeHint: SocialLoginConstants.googleScopes,
      );
      final authorization = await account.authorizationClient.authorizeScopes(
        SocialLoginConstants.googleScopes,
      );
      return authorization.accessToken;
    } on GoogleSignInException catch (error) {
      if (error.code == GoogleSignInExceptionCode.canceled ||
          error.code == GoogleSignInExceptionCode.interrupted) {
        return null;
      }
      rethrow;
    }
  }
}
