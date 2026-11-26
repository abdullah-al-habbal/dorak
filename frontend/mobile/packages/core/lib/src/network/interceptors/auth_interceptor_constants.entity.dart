import 'package:core/src/network/endpoints/auth.endpoints.dart';
import 'package:core/src/network/exceptions/api_error_code_constants.entity.dart';

class AuthInterceptorConstants {
  const AuthInterceptorConstants._();

  static const String authInterceptorSocialPathPrefix = '/client/social/';

  /// `RequestOptions.extra` key for a call whose 401 rejects the submitted
  /// credential (the account-deletion password), not the session.
  static const String authInterceptorKeepSessionOn401Key =
      'keep_session_on_401';

  /// 403 answers that reject one action for a business reason (a pending or
  /// suspended brand, a premium feature that is off) and say nothing about the
  /// session, so they never sign the user out. Every other 403 does.
  static const Set<String> authInterceptorBusinessForbiddenCodes = {
    ApiErrorCodeConstants.apiErrorCodeBrandNotApproved,
    ApiErrorCodeConstants.apiErrorCodeBrandSuspended,
    ApiErrorCodeConstants.apiErrorCodeFeatureNotEnabled,
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
