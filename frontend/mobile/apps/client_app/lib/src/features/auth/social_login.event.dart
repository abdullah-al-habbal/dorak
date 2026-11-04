import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

abstract class SocialLoginEvent extends Equatable {
  const SocialLoginEvent();

  @override
  List<Object?> get props => const [];
}

class SocialLoginStarted extends SocialLoginEvent {
  const SocialLoginStarted(this.provider);

  final SocialAuthProvider provider;

  @override
  List<Object?> get props => [provider];
}
