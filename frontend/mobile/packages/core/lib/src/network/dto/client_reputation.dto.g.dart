// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'client_reputation.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ClientReputationDto _$ClientReputationDtoFromJson(Map<String, dynamic> json) =>
    ClientReputationDto(
      average: (json['average'] as num?)?.toDouble(),
      count: (json['count'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$ClientReputationDtoToJson(
  ClientReputationDto instance,
) => <String, dynamic>{'average': instance.average, 'count': instance.count};
