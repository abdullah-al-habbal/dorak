import 'package:equatable/equatable.dart';

sealed class DeleteAccountEvent extends Equatable {
  const DeleteAccountEvent();

  @override
  List<Object?> get props => [];
}

class DeleteAccountSubmitted extends DeleteAccountEvent {
  const DeleteAccountSubmitted(this.password);

  final String password;

  @override
  List<Object?> get props => [password];
}
