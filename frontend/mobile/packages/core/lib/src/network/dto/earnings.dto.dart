import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/earnings_total.dto.dart';

part 'earnings.dto.g.dart';

/// `GET /branch/earnings` and `GET /barber/earnings`: per-currency totals.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class EarningsDto {
  final String scope;
  @JsonKey(defaultValue: <EarningsTotalDto>[])
  final List<EarningsTotalDto> totals;

  const EarningsDto({required this.scope, this.totals = const []});

  factory EarningsDto.fromJson(Map<String, dynamic> json) =>
      _$EarningsDtoFromJson(json);
}
