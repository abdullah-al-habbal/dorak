import 'package:core/core.dart';

abstract class OnboardingConfigRepository {
  Future<OnboardingConfigDto> fetchOnboardingConfig({String? locale});
}

class DioOnboardingConfigRepository implements OnboardingConfigRepository {
  final ApiClient _client;
  final Map<String, OnboardingConfigDto> _cache = {};

  DioOnboardingConfigRepository(this._client);

  @override
  Future<OnboardingConfigDto> fetchOnboardingConfig({String? locale}) async {
    final key = locale ?? LocaleCodes.english;
    final cached = _cache[key];
    if (cached != null) return cached;

    final config = await _client.get(
      ApiEndpoints.app.onboardingConfig,
      parser: (json) =>
          OnboardingConfigDto.fromJson(json as Map<String, dynamic>),
    );

    _cache[key] = config;
    return config;
  }
}
