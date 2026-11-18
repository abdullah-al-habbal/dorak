import 'package:core/src/network/endpoints/api.endpoints.dart';

/// The auth routes of one staff guard (barber or branch).
class StaffAuthRoutes {
  const StaffAuthRoutes({
    required this.login,
    required this.logout,
    required this.refreshToken,
    required this.forgotPassword,
    required this.resetPassword,
    this.deleteAccount,
  });

  factory StaffAuthRoutes.barber() => StaffAuthRoutes(
    login: ApiEndpoints.barberAuth.login,
    logout: ApiEndpoints.barberAuth.logout,
    refreshToken: ApiEndpoints.barberAuth.refreshToken,
    forgotPassword: ApiEndpoints.barberAuth.forgotPassword,
    resetPassword: ApiEndpoints.barberAuth.resetPassword,
    deleteAccount: ApiEndpoints.barberAuth.deleteAccount,
  );

  factory StaffAuthRoutes.branch() => StaffAuthRoutes(
    login: ApiEndpoints.branchAuth.login,
    logout: ApiEndpoints.branchAuth.logout,
    refreshToken: ApiEndpoints.branchAuth.refreshToken,
    forgotPassword: ApiEndpoints.branchAuth.forgotPassword,
    resetPassword: ApiEndpoints.branchAuth.resetPassword,
  );

  final String login;
  final String logout;
  final String refreshToken;
  final String forgotPassword;
  final String resetPassword;

  /// Only barbers can delete their own account; a branch account is removed by its owner or an admin.
  final String? deleteAccount;
}
