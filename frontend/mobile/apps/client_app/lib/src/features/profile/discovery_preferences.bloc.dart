import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/profile/discovery_preferences.state.dart';

class DiscoveryPreferencesCubit extends Cubit<DiscoveryPreferencesState> {
  DiscoveryPreferencesCubit(this._repository)
    : super(const DiscoveryPreferencesState());

  static const String defaultRadiusKey = 'default_radius';
  static const String hiddenBrandIdsKey = 'hidden_brand_ids';
  static const String showUnavailableKey = 'show_unavailable';

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
    double? defaultRadius,
    bool? showUnavailable,
    List<String>? hiddenBrandIds,
  }) async {
    if (state.isSaving) return;
    final values = <String, dynamic>{
      defaultRadiusKey: ?defaultRadius,
      showUnavailableKey: ?showUnavailable,
      hiddenBrandIdsKey: ?hiddenBrandIds,
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
