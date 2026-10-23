// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'explore_search_item.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ExploreSearchItemDto _$ExploreSearchItemDtoFromJson(
  Map<String, dynamic> json,
) => ExploreSearchItemDto(
  type: json['type'] as String,
  distance: (json['distance'] as num?)?.toDouble(),
  branch: ExploreSearchItemDto._branchEntity(json, 'branch') == null
      ? null
      : BranchDto.fromJson(
          ExploreSearchItemDto._branchEntity(json, 'branch')
              as Map<String, dynamic>,
        ),
  barber: ExploreSearchItemDto._barberEntity(json, 'barber') == null
      ? null
      : BarberProfileDto.fromJson(
          ExploreSearchItemDto._barberEntity(json, 'barber')
              as Map<String, dynamic>,
        ),
);
