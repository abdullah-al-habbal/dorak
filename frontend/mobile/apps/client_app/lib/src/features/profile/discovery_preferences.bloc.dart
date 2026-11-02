import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/profile/discovery_preferences.state.dart';
import 'package:client_app/src/features/profile/discovery_preferences_constants.entity.dart';

class DiscoveryPreferencesCubit extends Cubit<DiscoveryPreferencesState> {
  DiscoveryPreferencesCubit(this._repository, this._brandRepository)
    : super(const DiscoveryPreferencesState());

  final ClientInteractionRepository _repository;
  final BrandRepository _brandRepository;

  Future<void> load() async {
    emit(DiscoveryPreferencesState(isLoading: true, brands: state.brands));
    try {
      final preferences = await _repository.getDiscoveryPreferences();
      if (!isClosed) {
        emit(
          DiscoveryPreferencesState(
            preferences: preferences,
            brands: state.brands,
          ),
        );
      }
    } catch (error) {
      if (!isClosed) {
        emit(DiscoveryPreferencesState(error: error, brands: state.brands));
      }
    }
  }

  /// Loads the public brand list used by the hide-a-brand picker.
  Future<void> loadBrands() async {
    if (state.isLoadingBrands) return;
    emit(_withBrands(isLoadingBrands: true));
    try {
      final page = await _brandRepository.getBrands(
        perPage: DiscoveryPreferencesConstants.brandPageSize,
      );
      if (!isClosed) emit(_withBrands(brands: page.data));
    } catch (error) {
      if (!isClosed) emit(_withBrands(brandsError: error));
    }
  }

  /// Hides the brand when visible, shows it again when already hidden.
  Future<void> toggleBrand(String brandId) {
    final hidden = [...?state.preferences?.hiddenBrandIds];
    if (!hidden.remove(brandId)) hidden.add(brandId);
    return save(hiddenBrandIds: hidden);
  }

  Future<void> save({
    double? defaultRadiusKm,
    bool? allowsUnavailableResults,
    List<String>? hiddenBrandIds,
  }) async {
    if (state.isSaving) return;
    final values = <String, dynamic>{
      DiscoveryPreferencesConstants.defaultRadiusKey: ?defaultRadiusKm,
      DiscoveryPreferencesConstants.showUnavailableKey:
          ?allowsUnavailableResults,
      DiscoveryPreferencesConstants.hiddenBrandIdsKey: ?hiddenBrandIds,
    };
    if (values.isEmpty) return;
    emit(
      DiscoveryPreferencesState(
        isSaving: true,
        preferences: state.preferences,
        brands: state.brands,
      ),
    );
    try {
      final preferences = await _repository.updateDiscoveryPreferences(values);
      if (!isClosed) {
        emit(
          DiscoveryPreferencesState(
            preferences: preferences,
            brands: state.brands,
            saved: true,
          ),
        );
      }
    } catch (error) {
      if (!isClosed) {
        emit(
          DiscoveryPreferencesState(
            preferences: state.preferences,
            brands: state.brands,
            error: error,
          ),
        );
      }
    }
  }

  DiscoveryPreferencesState _withBrands({
    List<BrandDto>? brands,
    bool isLoadingBrands = false,
    Object? brandsError,
  }) => DiscoveryPreferencesState(
    preferences: state.preferences,
    brands: brands ?? state.brands,
    isLoadingBrands: isLoadingBrands,
    brandsError: brandsError,
  );
}
