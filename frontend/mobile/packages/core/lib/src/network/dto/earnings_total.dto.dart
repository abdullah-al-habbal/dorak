import 'package:json_annotation/json_annotation.dart';

part 'earnings_total.dto.g.dart';

/// Completed-booking revenue in one currency. `commissionMinor` is only sent
/// for branch scope; `netMinor` is null when a stylist's commission is unknown.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class EarningsTotalDto {
  final String currencyCode;
  @JsonKey(defaultValue: 0)
  final int grossMinor;
  final int? commissionMinor;
  final int? netMinor;
  @JsonKey(defaultValue: 0)
  final int completedBookingsCount;

  const EarningsTotalDto({
    required this.currencyCode,
    this.grossMinor = 0,
    this.commissionMinor,
    this.netMinor,
    this.completedBookingsCount = 0,
  });

  factory EarningsTotalDto.fromJson(Map<String, dynamic> json) =>
      _$EarningsTotalDtoFromJson(json);
}
