import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/profile/discovery_preferences.state.dart';
import 'package:client_app/src/features/profile/discovery_preferences_constants.entity.dart';

class DiscoveryPreferencesCubit extends Cubit<DiscoveryPreferencesState> {
  DiscoveryPreferencesCubit(this._repository)
    : super(const DiscoveryPreferencesState());

  final ClientInteractionRepository _repository;

  Future<void> load() async {
    emit(const DiscoveryPreferencesState(isLoading: true));
    try {
      final preferences = await _repository.getDiscoveryPreferences();
      if (!isClosed) emit(DiscoveryPreferencesState(preferences: preferences));
    } catch (error) {
      if (!isClosed) emit(DiscoveryPreferencesState(error: error));
    }
  }

  Future<void> save({
    double? defaultRadiusKm,
    bool? showUnavailable,
    List<String>? hiddenBrandIds,
  }) async {
    if (state.isSaving) return;
    final values = <String, dynamic>{
      DiscoveryPreferencesConstants.defaultRadiusKey: ?defaultRadiusKm,
      DiscoveryPreferencesConstants.showUnavailableKey: ?showUnavailable,
      DiscoveryPreferencesConstants.hiddenBrandIdsKey: ?hiddenBrandIds,
    };
    if (values.isEmpty) return;
    emit(
      DiscoveryPreferencesState(isSaving: true, preferences: state.preferences),
    );
    try {
      final preferences = await _repository.updateDiscoveryPreferences(values);
      if (!isClosed) {
        emit(DiscoveryPreferencesState(preferences: preferences, saved: true));
      }
    } catch (error) {
      if (!isClosed) {
        emit(
          DiscoveryPreferencesState(
            preferences: state.preferences,
            error: error,
          ),
        );
      }
    }
  }
}
