import 'package:core/core.dart';
import 'client_fixtures.dart';

class FakeProfileRepository implements ProfileRepository {
  ClientDto profile = ClientFixtures.profileClient;
  Object? getProfileError;
  int getProfileCalls = 0;

  @override
  Future<ClientDto> getProfile() async {
    getProfileCalls++;
    final error = getProfileError;
    if (error != null) throw error;
    return profile;
  }

  @override
  Future<ClientDto> updateProfile({String? name, String? email}) {
    throw UnimplementedError();
  }

  @override
  Future<void> requestPhoneOtp(String phone) {
    throw UnimplementedError();
  }

  @override
  Future<ClientDto> verifyPhoneOtp(String code) {
    throw UnimplementedError();
  }

  @override
  Future<AvatarDto> uploadAvatar(String filePath) {
    throw UnimplementedError();
  }

  @override
  Future<UniversePreferenceDto> updatePreferredUniverse(String universe) {
    throw UnimplementedError();
  }

  @override
  Future<SettingsDto> getSettings() {
    throw UnimplementedError();
  }

  @override
  Future<SettingsDto> updateSettings({
    String? preferredLanguage,
    bool? allowsNotifications,
    String? displayCurrencyCode,
    String? themeMode,
    String? priceDisplayMode,
  }) {
    throw UnimplementedError();
  }
}
