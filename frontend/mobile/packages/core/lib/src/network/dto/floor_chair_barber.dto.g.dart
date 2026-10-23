// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'floor_chair_barber.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FloorChairBarberDto _$FloorChairBarberDtoFromJson(Map<String, dynamic> json) =>
    FloorChairBarberDto(
      id: json['id'] as String,
      name: json['name'] as String,
      services:
          (json['services'] as List<dynamic>?)
              ?.map(
                (e) => BookingServiceDto.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          const [],
    );
