import 'package:core/src/network/endpoints/auth.endpoints.dart';

class AuthInterceptorConstants {
  const AuthInterceptorConstants._();

  static const String authInterceptorSocialPathPrefix = '/client/social/';

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
