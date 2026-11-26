import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

enum OwnerHomeStatus { loading, ready, noBrand, failed }

class OwnerHomeState extends Equatable {
  const OwnerHomeState({
    this.status = OwnerHomeStatus.loading,
    this.brand,
    this.error,
    this.actionError,
    this.resubmitted = false,
    this.isResubmitting = false,
  });

  final OwnerHomeStatus status;

  /// The first brand of the owner; the app manages one brand at a time.
  final OwnerBrandDto? brand;
  final Object? error;
  final Object? actionError;
  final bool resubmitted;
  final bool isResubmitting;

  /// A suspended brand is read-only; a pending one has the D11 limits, enforced by the API.
  OwnerBrandStatus get brandStatus => brand?.status ?? OwnerBrandStatus.unknown;

  bool get isReadOnly => brandStatus == OwnerBrandStatus.suspended;

  OwnerHomeState copyWith({
    OwnerHomeStatus? status,
    OwnerBrandDto? brand,
    Object? error,
    Object? actionError,
    bool? resubmitted,
    bool? isResubmitting,
    bool clearErrors = false,
  }) => OwnerHomeState(
    status: status ?? this.status,
    brand: brand ?? this.brand,
    error: clearErrors ? null : error ?? this.error,
    actionError: clearErrors ? null : actionError ?? this.actionError,
    resubmitted: resubmitted ?? this.resubmitted,
    isResubmitting: isResubmitting ?? this.isResubmitting,
  );

  @override
  List<Object?> get props => [
    status,
    brand?.id,
    brand?.status,
    brand?.statusReason,
    brand?.submissionCount,
    error,
    actionError,
    resubmitted,
    isResubmitting,
  ];
}
