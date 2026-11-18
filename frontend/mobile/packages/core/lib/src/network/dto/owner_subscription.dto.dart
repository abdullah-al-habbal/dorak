import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/localized_map.entity.dart';

part 'owner_subscription.dto.g.dart';

/// The plan of one brand, read-only (`GET /owner/subscription`).
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class OwnerPlanDto {
  const OwnerPlanDto({
    required this.id,
    required this.name,
    this.priceAmountMinor = 0,
    this.currencyCode,
    this.intervalUnit,
    this.intervalCount = 1,
    this.featureKeys = const [],
  });

  final String id;
  @JsonKey(fromJson: localizedMapFromJson)
  final Map<String, String> name;
  @JsonKey(defaultValue: 0)
  final int priceAmountMinor;
  final String? currencyCode;
  final String? intervalUnit;
  @JsonKey(defaultValue: 1)
  final int intervalCount;
  @JsonKey(defaultValue: <String>[])
  final List<String> featureKeys;

  factory OwnerPlanDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerPlanDtoFromJson(json);
}

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class OwnerSubscriptionDto {
  const OwnerSubscriptionDto({
    required this.id,
    required this.status,
    required this.brandId,
    required this.brandName,
    required this.plan,
    this.startsAt,
    this.endsAt,
    this.pastDueAt,
    this.graceEndsAt,
    this.cancelledAt,
  });

  final String id;

  /// A string on purpose: new billing states must not break the screen.
  final String status;
  @JsonKey(readValue: _brandId)
  final String brandId;
  @JsonKey(readValue: _brandName, fromJson: localizedMapFromJson)
  final Map<String, String> brandName;
  final OwnerPlanDto plan;
  final DateTime? startsAt;
  final DateTime? endsAt;
  final DateTime? pastDueAt;
  final DateTime? graceEndsAt;
  final DateTime? cancelledAt;

  factory OwnerSubscriptionDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerSubscriptionDtoFromJson(json);
}

Object? _brandId(Map<dynamic, dynamic> json, String key) =>
    (json['brand'] as Map<dynamic, dynamic>?)?['id'];

Object? _brandName(Map<dynamic, dynamic> json, String key) =>
    (json['brand'] as Map<dynamic, dynamic>?)?['name'];
