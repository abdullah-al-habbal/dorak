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

Map<String, dynamic> _$AtHomeLocationDtoToJson(AtHomeLocationDto instance) =>
    <String, dynamic>{
      'street': instance.street,
      'building': instance.building,
      'unit': instance.unit,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
    };
