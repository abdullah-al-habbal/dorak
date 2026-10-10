import 'package:client_app/src/core/navigation/app_routes.entity.dart';

class AppGate {
  AppGate._();

  static String resolve({
    required bool isAuthenticated,
    required bool dontShowOnboarding,
    required bool profileCompleted,
  }) {
    if (isAuthenticated) {
      return profileCompleted ? AppRoutes.home : AppRoutes.profileCompletion;
    }
    if (dontShowOnboarding) return AppRoutes.home;
    return AppRoutes.authEntry;
  }
}
