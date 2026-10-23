import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/barber_profile.dto.dart';
import 'package:core/src/network/dto/branch.dto.dart';

part 'explore_search_item.dto.g.dart';

/// One `explore/search` result: a shop (`branch`) or a freelancer (`barber`).
/// The wire `entity` is parsed into whichever of [branch] / [barber] matches
/// `type`; the other stays null.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ExploreSearchItemDto {
  final String type;
  final double? distance;
  @JsonKey(readValue: _branchEntity)
  final BranchDto? branch;
  @JsonKey(readValue: _barberEntity)
  final BarberProfileDto? barber;

  const ExploreSearchItemDto({
    required this.type,
    this.distance,
    this.branch,
    this.barber,
  });

  bool get isBarber => type == 'barber' && barber != null;

  String get id => branch?.id ?? barber?.id ?? '';

  factory ExploreSearchItemDto.fromJson(Map<String, dynamic> json) =>
      _$ExploreSearchItemDtoFromJson(json);

  static Object? _branchEntity(Map<dynamic, dynamic> json, String key) =>
      json['type'] == 'branch' ? json['entity'] : null;

  static Object? _barberEntity(Map<dynamic, dynamic> json, String key) =>
      json['type'] == 'barber' ? json['entity'] : null;
}
