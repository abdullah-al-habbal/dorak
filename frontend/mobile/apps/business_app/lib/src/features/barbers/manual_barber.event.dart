import 'package:equatable/equatable.dart';

sealed class ManualBarberEvent extends Equatable {
  const ManualBarberEvent();

  @override
  List<Object?> get props => [];
}

class ManualBarberSubmitted extends ManualBarberEvent {
  const ManualBarberSubmitted({
    required this.nameEn,
    required this.nameAr,
    required this.phone,
    this.chairId,
  });

  final String nameEn;
  final String nameAr;
  final String phone;
  final String? chairId;

  @override
  List<Object?> get props => [nameEn, nameAr, phone, chairId];
}
