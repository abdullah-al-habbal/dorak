import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class DiscoveryPreferencesState extends Equatable {
  const DiscoveryPreferencesState({
    this.isLoading = false,
    this.isSaving = false,
    this.isLoadingBrands = false,
    this.preferences,
    this.brands = const [],
    this.saved = false,
    this.error,
    this.brandsError,
  });

  final bool isLoading;
  final bool isSaving;
  final bool isLoadingBrands;
  final DiscoveryPreferenceDto? preferences;
  final List<BrandDto> brands;
  final bool saved;
  final Object? error;
  final Object? brandsError;

  @override
  List<Object?> get props => [
    isLoading,
    isSaving,
    isLoadingBrands,
    preferences,
    brands,
    saved,
    error,
    brandsError,
  ];
}
