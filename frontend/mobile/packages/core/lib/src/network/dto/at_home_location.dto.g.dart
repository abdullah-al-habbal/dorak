// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'at_home_location.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AtHomeLocationDto _$AtHomeLocationDtoFromJson(Map<String, dynamic> json) =>
    AtHomeLocationDto(
      street: json['street'] as String,
      building: json['building'] as String,
      unit: json['unit'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
    );
