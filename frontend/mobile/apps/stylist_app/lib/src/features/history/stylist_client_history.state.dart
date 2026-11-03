import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class StylistClientHistoryState extends Equatable {
  StylistClientHistoryState({
    this.clientId,
    this.loading = false,
    this.uploadingId,
    List<ServiceHistoryDto> visits = const [],
    this.error,
  }) : visits = List.unmodifiable(visits);

  final String? clientId;
  final bool loading;
  final String? uploadingId;
  final List<ServiceHistoryDto> visits;
  final Object? error;

  StylistClientHistoryState copyWith({
    String? clientId,
    bool? loading,
    String? uploadingId,
    bool clearUploading = false,
    List<ServiceHistoryDto>? visits,
    Object? error,
    bool clearError = false,
  }) => StylistClientHistoryState(
    clientId: clientId ?? this.clientId,
    loading: loading ?? this.loading,
    uploadingId: clearUploading ? null : uploadingId ?? this.uploadingId,
    visits: visits ?? this.visits,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [clientId, loading, uploadingId, visits, error];
}
