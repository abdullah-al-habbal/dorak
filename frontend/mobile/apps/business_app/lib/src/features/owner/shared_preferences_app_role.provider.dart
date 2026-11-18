import 'package:shared_preferences/shared_preferences.dart';

import 'package:business_app/src/features/owner/app_role.entity.dart';
import 'package:business_app/src/features/owner/app_role.provider.dart';

class SharedPreferencesAppRoleProvider implements AppRoleProvider {
  const SharedPreferencesAppRoleProvider();

  static const _key = 'business_app_role';

  @override
  Future<AppRole?> read() async {
    final preferences = await SharedPreferences.getInstance();
    return AppRole.fromWire(preferences.getString(_key));
  }

  @override
  Future<void> write(AppRole role) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_key, role.wire);
  }

  @override
  Future<void> clear() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_key);
  }
}
