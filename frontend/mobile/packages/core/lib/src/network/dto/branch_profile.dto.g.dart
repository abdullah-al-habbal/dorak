// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_profile.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BranchProfileDto _$BranchProfileDtoFromJson(Map<String, dynamic> json) =>
    BranchProfileDto(
      id: json['id'] as String,
      name: json['name'] as String,
      brandId: json['brand_id'] as String,
      openingHours:
          (json['opening_hours'] as List<dynamic>?)
              ?.map(
                (e) => BranchOpeningHourDto.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          [],
      translations: json['translations'] == null
          ? const BranchProfileTextsDto()
          : BranchProfileTextsDto.fromJsonValue(json['translations']),
    );
