import 'package:core/src/network/endpoints/auth.endpoints.dart';

class AuthInterceptorConstants {
  const AuthInterceptorConstants._();

  static const String authInterceptorSocialPathPrefix = '/client/social/';

  /// 403 answers that reject one action for a business reason (D11: the brand
  /// is still pending) and say nothing about the session, so they never sign the user out.
  static const Set<String> authInterceptorBusinessForbiddenCodes = {
    'brand_not_approved',
  };

  static const Set<String> authInterceptorLifecyclePaths = {
    AuthEndpoints.login,
    AuthEndpoints.register,
    AuthEndpoints.logout,
    AuthEndpoints.refreshToken,
    AuthEndpoints.forgotPassword,
    AuthEndpoints.verifyResetCode,
    AuthEndpoints.resetPassword,
    AuthEndpoints.verifyEmail,
    AuthEndpoints.sendEmailVerification,
    AuthEndpoints.changePassword,
  };
}
