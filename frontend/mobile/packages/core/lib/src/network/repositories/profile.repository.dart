import 'package:dio/dio.dart';

import 'package:core/core.dart';

abstract class ProfileRepository {
  Future<ClientDto> getProfile();

  Future<ClientDto> updateProfile({String? name, String? email});

  Future<void> requestPhoneOtp(String phone);

  Future<ClientDto> verifyPhoneOtp(String code);

  Future<AvatarDto> uploadAvatar(String filePath);

  Future<UniversePreferenceDto> updatePreferredUniverse(String universe);
}

class DioProfileRepository implements ProfileRepository {
  const DioProfileRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<ClientDto> getProfile() {
    return _apiClient.get<ClientDto>(
      ProfileEndpoints.show,
      parser: (json) => ClientDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<ClientDto> updateProfile({String? name, String? email}) {
    final data = <String, dynamic>{'name': ?name, 'email': ?email};
    return _apiClient.patch<ClientDto>(
      ProfileEndpoints.update,
      data: data,
      parser: (json) => ClientDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<void> requestPhoneOtp(String phone) {
    return _apiClient.post<void>(
      ProfileEndpoints.phoneOtp,
      data: {'phone': phone},
      parser: (_) {},
    );
  }

  @override
  Future<ClientDto> verifyPhoneOtp(String code) {
    return _apiClient.post<ClientDto>(
      ProfileEndpoints.phoneVerify,
      data: {'code': code},
      parser: (json) => ClientDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<AvatarDto> uploadAvatar(String filePath) async {
    final formData = FormData.fromMap({
      'avatar': await MultipartFile.fromFile(filePath),
    });
    return _apiClient.post<AvatarDto>(
      ProfileEndpoints.avatar,
      data: formData,
      parser: (json) => AvatarDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<UniversePreferenceDto> updatePreferredUniverse(String universe) {
    return _apiClient.patch<UniversePreferenceDto>(
      ProfileEndpoints.universe,
      data: {'preferred_universe': universe},
      parser: (json) =>
          UniversePreferenceDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
