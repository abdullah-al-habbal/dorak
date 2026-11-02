import 'package:json_annotation/json_annotation.dart';

part 'barber_affiliation.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BarberAffiliationDto {
  final String id;
  final String barberId;
  final String affiliableId;
  final String affiliableType;
  final String status;
  final double? commissionPercent;
  final DateTime? invitedAt;
  final DateTime? acceptedAt;
  final DateTime? terminatedAt;

  const BarberAffiliationDto({
    required this.id,
    required this.barberId,
    required this.affiliableId,
    required this.affiliableType,
    required this.status,
    this.commissionPercent,
    this.invitedAt,
    this.acceptedAt,
    this.terminatedAt,
  });

  bool get isPending => status == 'pending';
  bool get isActive => status == 'active';

  factory BarberAffiliationDto.fromJson(Map<String, dynamic> json) =>
      _$BarberAffiliationDtoFromJson(json);
}
