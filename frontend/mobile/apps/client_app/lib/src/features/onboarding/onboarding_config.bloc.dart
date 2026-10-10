import 'package:bloc_concurrency/bloc_concurrency.dart';
import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/onboarding/onboarding_config.event.dart';
import 'package:client_app/src/features/onboarding/onboarding_config.state.dart';

class OnboardingConfigBloc
    extends Bloc<OnboardingConfigEvent, OnboardingConfigState> {
  OnboardingConfigBloc(this._repository)
    : super(const OnboardingConfigState()) {
    on<OnboardingConfigLoadRequested>(_onLoad, transformer: restartable());
  }

  final OnboardingConfigRepository _repository;
  int _loadGeneration = 0;

  Future<void> _onLoad(
    OnboardingConfigLoadRequested event,
    Emitter<OnboardingConfigState> emit,
  ) async {
    final generation = ++_loadGeneration;
    final sameLocale = state.localeCode == event.localeCode;
    final alreadyLoaded = state.config != null && state.error == null;
    if (sameLocale && (state.isLoading || alreadyLoaded)) return;

    emit(
      state.copyWith(
        localeCode: event.localeCode,
        isLoading: true,
        clearError: true,
      ),
    );
    try {
      final config = await _repository.fetchOnboardingConfig(
        locale: event.localeCode,
      );
      if (emit.isDone || generation != _loadGeneration) return;
      emit(state.copyWith(config: config, isLoading: false));
    } catch (e) {
      if (emit.isDone || generation != _loadGeneration) return;
      emit(state.copyWith(isLoading: false, error: e));
    }
  }
}
