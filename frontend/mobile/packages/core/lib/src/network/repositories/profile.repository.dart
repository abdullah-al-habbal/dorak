import 'package:dio/dio.dart';

import 'package:core/core.dart';

abstract class ProfileRepository {
  Future<ClientDto> getProfile();

  /// [currentPassword] is required by the backend when [email] is a new address.
  Future<ClientDto> updateProfile({
    String? name,
    String? email,
    String? currentPassword,
  });

  Future<void> requestPhoneOtp(String phone);

  Future<ClientDto> verifyPhoneOtp(String code);

  Future<AvatarDto> uploadAvatar(String filePath);

  Future<UniversePreferenceDto> updatePreferredUniverse(String universe);

  Future<SettingsDto> getSettings();

  Future<SettingsDto> updateSettings({
    String? preferredLanguage,
    bool? allowsNotifications,
    String? displayCurrencyCode,
    String? themeMode,
    String? priceDisplayMode,
  });
}

class DioProfileRepository implements ProfileRepository {
  const DioProfileRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<ClientDto> getProfile() {
    return _apiClient.get<ClientDto>(
      ApiEndpoints.profile.show,
      parser: (json) => ClientDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<ClientDto> updateProfile({
    String? name,
    String? email,
    String? currentPassword,
  }) {
    final data = <String, dynamic>{
      'name': ?name,
      'email': ?email,
      'current_password': ?currentPassword,
    };
    return _apiClient.patch<ClientDto>(
      ApiEndpoints.profile.update,
      data: data,
      parser: (json) => ClientDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<void> requestPhoneOtp(String phone) {
    return _apiClient.post<void>(
      ApiEndpoints.profile.phoneOtp,
      data: {'phone': phone},
      parser: (_) {},
    );
  }

  @override
  Future<ClientDto> verifyPhoneOtp(String code) {
    return _apiClient.post<ClientDto>(
      ApiEndpoints.profile.phoneVerify,
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
      ApiEndpoints.profile.avatar,
      data: formData,
      parser: (json) => AvatarDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<UniversePreferenceDto> updatePreferredUniverse(String universe) {
    return _apiClient.patch<UniversePreferenceDto>(
      ApiEndpoints.profile.universe,
      data: {'preferred_universe': universe},
      parser: (json) =>
          UniversePreferenceDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<SettingsDto> getSettings() {
    return _apiClient.get<SettingsDto>(
      ApiEndpoints.profile.settings,
      parser: (json) => SettingsDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<SettingsDto> updateSettings({
    String? preferredLanguage,
    bool? allowsNotifications,
    String? displayCurrencyCode,
    String? themeMode,
    String? priceDisplayMode,
  }) {
    final data = <String, dynamic>{
      'preferred_language': ?preferredLanguage,
      'allows_notifications': ?allowsNotifications,
      'display_currency_code': ?displayCurrencyCode,
      'theme_mode': ?themeMode,
      'price_display_mode': ?priceDisplayMode,
    };
    return _apiClient.patch<SettingsDto>(
      ApiEndpoints.profile.settings,
      data: data,
      parser: (json) => SettingsDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
