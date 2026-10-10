import 'dart:ui' show Locale;

import 'package:equatable/equatable.dart';

abstract class LocaleEvent extends Equatable {
  const LocaleEvent();

  @override
  List<Object?> get props => const [];
}

class LocaleToggled extends LocaleEvent {}

class LocaleSet extends LocaleEvent {
  const LocaleSet(this.locale);

  final Locale locale;

  @override
  List<Object?> get props => [locale];
}
