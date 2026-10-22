import 'package:core/core.dart';

class FakeProfileRepository implements ProfileRepository {
  static const ClientDto defaultClient = ClientDto(
    id: 'uuid-1',
    name: 'Sara',
    email: 'sara@example.com',
    phone: '+966500000001',
  );

  ClientDto profile = defaultClient;
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
}
