// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BookingDto _$BookingDtoFromJson(Map<String, dynamic> json) => BookingDto(
  id: json['id'] as String,
  startsAt: DateTime.parse(json['starts_at'] as String),
  endsAt: json['ends_at'] == null
      ? null
      : DateTime.parse(json['ends_at'] as String),
  status: $enumDecode(
    _$BookingStatusEnumMap,
    json['booking_status'],
    unknownValue: BookingStatus.unknown,
  ),
  paymentMethod: json['payment_method'] as String? ?? 'pay_at_salon',
  paymentStatus: json['payment_status'] as String? ?? 'unpaid_in_person',
  cancellationEligible: json['cancellation_eligible'] as bool?,
  cancellationCutoffAt: json['cancellation_cutoff_at'] == null
      ? null
      : DateTime.parse(json['cancellation_cutoff_at'] as String),
  chair: json['chair'] == null
      ? null
      : BookingChairDto.fromJson(json['chair'] as Map<String, dynamic>),
  barber: json['barber'] == null
      ? null
      : BookingBarberDto.fromJson(json['barber'] as Map<String, dynamic>),
  client: json['client'] == null
      ? null
      : BookingClientDto.fromJson(json['client'] as Map<String, dynamic>),
  services:
      (json['services'] as List<dynamic>?)
          ?.map((e) => BookingServiceDto.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
  homeAddress: json['home_address'] == null
      ? null
      : AtHomeLocationDto.fromJson(
          json['home_address'] as Map<String, dynamic>,
        ),
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$BookingDtoToJson(
  BookingDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'starts_at': instance.startsAt.toIso8601String(),
  'ends_at': instance.endsAt?.toIso8601String(),
  'booking_status': _$BookingStatusEnumMap[instance.status]!,
  'payment_method': instance.paymentMethod,
  'payment_status': instance.paymentStatus,
  'cancellation_eligible': instance.cancellationEligible,
  'cancellation_cutoff_at': instance.cancellationCutoffAt?.toIso8601String(),
  'chair': instance.chair,
  'barber': instance.barber,
  'client': instance.client,
  'services': instance.services,
  'home_address': instance.homeAddress,
  'created_at': instance.createdAt?.toIso8601String(),
};

const _$BookingStatusEnumMap = {
  BookingStatus.pending: 'pending',
  BookingStatus.confirmed: 'confirmed',
  BookingStatus.inProgress: 'in_progress',
  BookingStatus.cancelled: 'cancelled',
  BookingStatus.completed: 'completed',
  BookingStatus.noShow: 'no_show',
  BookingStatus.unknown: 'unknown',
};
