import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/barber_affiliation_status.entity.dart';

part 'barber_affiliation.dto.g.dart';

BarberAffiliationStatus _statusFromJson(Object? value) =>
    BarberAffiliationStatus.fromWire(value is String ? value : null);

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BarberAffiliationDto {
  final String id;
  final String barberId;
  final String affiliableId;
  final String affiliableType;
  @JsonKey(fromJson: _statusFromJson)
  final BarberAffiliationStatus status;
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

  bool get isPending => status == BarberAffiliationStatus.pending;
  bool get isActive => status == BarberAffiliationStatus.active;

  factory BarberAffiliationDto.fromJson(Map<String, dynamic> json) =>
      _$BarberAffiliationDtoFromJson(json);
}
