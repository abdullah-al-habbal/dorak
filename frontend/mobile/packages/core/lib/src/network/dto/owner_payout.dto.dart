import 'package:json_annotation/json_annotation.dart';

part 'owner_payout.dto.g.dart';

/// `GET /owner/payouts`, read-only. [status] and [directionType] stay strings so a
/// new backend value never breaks the list.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class OwnerPayoutDto {
  const OwnerPayoutDto({
    required this.id,
    required this.status,
    required this.directionType,
    required this.totalAmountMinor,
    required this.currencyCode,
    this.periodStartedAt,
    this.periodEndedAt,
    this.paidAt,
    this.externalReference,
  });

  final String id;
  final String status;
  final String directionType;
  final int totalAmountMinor;
  final String currencyCode;
  final DateTime? periodStartedAt;
  final DateTime? periodEndedAt;
  final DateTime? paidAt;
  final String? externalReference;

  factory OwnerPayoutDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerPayoutDtoFromJson(json);
}
