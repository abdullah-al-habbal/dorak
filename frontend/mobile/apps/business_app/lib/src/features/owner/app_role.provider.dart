import 'package:business_app/src/features/owner/app_role.entity.dart';

/// Remembers the role between launches. The token alone cannot tell a branch from an
/// owner without a network call, and the app must open offline.
abstract class AppRoleProvider {
  Future<AppRole?> read();

  Future<void> write(AppRole role);

  Future<void> clear();
}
