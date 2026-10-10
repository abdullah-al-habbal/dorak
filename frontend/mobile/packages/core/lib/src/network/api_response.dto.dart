import 'package:core/src/network/api_error_details.entity.dart';
import 'package:core/src/network/pagination_meta.dto.dart';

class ApiResponse<T> {
  final bool success;
  final int statusCode;
  final String code;
  final String? message;
  final String? timestamp;
  final T? data;
  final Map<String, dynamic>? meta;
  final ApiErrorDetails errors;

  const ApiResponse({
    required this.success,
    required this.statusCode,
    required this.code,
    this.message,
    this.timestamp,
    this.data,
    this.meta,
    this.errors = const ApiErrorDetails(),
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) => ApiResponse(
    success: json['success'] as bool,
    statusCode: (json['statusCode'] as num).toInt(),
    code: json['code'] as String,
    message: json['message'] as String?,
    timestamp: json['timestamp'] as String?,
    data: json['data'] == null ? null : fromJsonT(json['data']),
    meta: json['meta'] as Map<String, dynamic>?,
    errors: ApiErrorDetails.fromJson(json['errors']),
  );

  PaginationMeta? get pagination {
    final raw = meta?['pagination'];
    if (raw is! Map<String, dynamic>) return null;
    return PaginationMeta.fromJson(raw);
  }
}
