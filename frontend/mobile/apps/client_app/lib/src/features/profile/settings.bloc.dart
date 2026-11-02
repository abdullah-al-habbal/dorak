import 'package:core/core.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class SettingsState extends Equatable {
  const SettingsState({
    this.isLoading = false,
    this.isSaving = false,
    this.settings,
    this.saved = false,
    this.error,
  });

  final bool isLoading;
  final bool isSaving;
  final SettingsDto? settings;
  final bool saved;
  final Object? error;

  @override
  List<Object?> get props => [isLoading, isSaving, settings, saved, error];
}

class SettingsCubit extends Cubit<SettingsState> {
  SettingsCubit(this._repository) : super(const SettingsState());

  final ProfileRepository _repository;

  Future<void> load() async {
    emit(const SettingsState(isLoading: true));
    try {
      final settings = await _repository.getSettings();
      if (!isClosed) emit(SettingsState(settings: settings));
    } catch (error) {
      if (!isClosed) emit(SettingsState(error: error));
    }
  }

  Future<void> save({
    String? preferredLanguage,
    bool? allowsNotifications,
    String? displayCurrencyCode,
    String? theme,
    String? priceDisplayMode,
  }) async {
    if (state.isSaving) return;
    emit(SettingsState(isSaving: true, settings: state.settings));
    try {
      final settings = await _repository.updateSettings(
        preferredLanguage: preferredLanguage,
        allowsNotifications: allowsNotifications,
        displayCurrencyCode: displayCurrencyCode,
        theme: theme,
        priceDisplayMode: priceDisplayMode,
      );
      if (!isClosed) emit(SettingsState(settings: settings, saved: true));
    } catch (error) {
      if (!isClosed) {
        emit(SettingsState(settings: state.settings, error: error));
      }
    }
  }
}
