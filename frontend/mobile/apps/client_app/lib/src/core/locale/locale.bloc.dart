import 'dart:ui' show Locale;
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/core/locale/locale.event.dart';
import 'package:core/core.dart';

class LocaleBloc extends Bloc<LocaleEvent, Locale> {
  LocaleBloc() : super(const Locale(LocaleCodes.english)) {
    on<LocaleToggled>(_onLocaleToggled);
    on<LocaleSet>(_onLocaleSet);
  }

  void _onLocaleToggled(LocaleToggled event, Emitter<Locale> emit) {
    emit(
      state.languageCode == LocaleCodes.english
          ? const Locale(LocaleCodes.arabic)
          : const Locale(LocaleCodes.english),
    );
  }

  void _onLocaleSet(LocaleSet event, Emitter<Locale> emit) {
    if (event.locale == state) return;
    emit(event.locale);
  }
}
