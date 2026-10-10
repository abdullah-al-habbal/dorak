import 'package:equatable/equatable.dart';

sealed class ProfileCompletionEvent extends Equatable {
  const ProfileCompletionEvent();

  @override
  List<Object?> get props => [];
}

class ProfileCompletionSubmitted extends ProfileCompletionEvent {
  const ProfileCompletionSubmitted({required this.name, required this.phone});

  final String name;
  final String phone;

  @override
  List<Object?> get props => [name, phone];
}
