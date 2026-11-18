// ignore_for_file: prefer_initializing_formals
// The fields are private while the named parameters are public.
import 'package:core/core.dart';

import 'package:business_app/src/features/owner/app_role.entity.dart';
import 'package:business_app/src/features/owner/app_role.provider.dart';

/// Sends every auth call to the branch or the owner API, whichever role is selected,
/// and remembers the role once a login succeeds. Logout clears it.
class RoleAuthRepository implements StaffAuthRepository {
  RoleAuthRepository({
    required StaffAuthRepository branch,
    required StaffAuthRepository owner,
    required AppRoleProvider roles,
  }) : _branch = branch,
       _owner = owner,
       _roles = roles;

  final StaffAuthRepository _branch;
  final StaffAuthRepository _owner;
  final AppRoleProvider _roles;

  AppRole role = AppRole.branch;

  StaffAuthRepository get _active => role == AppRole.owner ? _owner : _branch;

  /// Loads the role saved by the last successful login.
  Future<void> restoreRole() async {
    role = await _roles.read() ?? AppRole.branch;
  }

  @override
  Future<String> login({
    required String email,
    required String password,
  }) async {
    final token = await _active.login(email: email, password: password);
    await _roles.write(role);
    return token;
  }

  @override
  Future<void> logout() async {
    try {
      await _active.logout();
    } finally {
      await _roles.clear();
    }
  }

  @override
  Future<String> refreshToken() => _active.refreshToken();

  @override
  Future<void> forgotPassword(String email) => _active.forgotPassword(email);

  @override
  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) => _active.resetPassword(
    email: email,
    code: code,
    password: password,
    passwordConfirmation: passwordConfirmation,
  );
}
