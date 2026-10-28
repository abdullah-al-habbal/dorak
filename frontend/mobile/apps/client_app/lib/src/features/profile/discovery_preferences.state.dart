import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class DiscoveryPreferencesState extends Equatable {
  const DiscoveryPreferencesState({
    this.isLoading = false,
    this.isSaving = false,
    this.preferences,
    this.saved = false,
    this.error,
  });

  final bool isLoading;
  final bool isSaving;
  final DiscoveryPreferenceDto? preferences;
  final bool saved;
  final Object? error;

  @override
  List<Object?> get props => [isLoading, isSaving, preferences, saved, error];
}
