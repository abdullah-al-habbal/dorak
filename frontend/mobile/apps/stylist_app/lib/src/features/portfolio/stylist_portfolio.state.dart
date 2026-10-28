import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class StylistPortfolioState extends Equatable {
  StylistPortfolioState({
    this.loading = false,
    this.uploading = false,
    this.deletingId,
    List<PortfolioPhotoDto> photos = const [],
    this.error,
  }) : photos = List.unmodifiable(photos);

  final bool loading;
  final bool uploading;
  final String? deletingId;
  final List<PortfolioPhotoDto> photos;
  final Object? error;

  StylistPortfolioState copyWith({
    bool? loading,
    bool? uploading,
    String? deletingId,
    bool clearDeleting = false,
    List<PortfolioPhotoDto>? photos,
    Object? error,
    bool clearError = false,
  }) => StylistPortfolioState(
    loading: loading ?? this.loading,
    uploading: uploading ?? this.uploading,
    deletingId: clearDeleting ? null : deletingId ?? this.deletingId,
    photos: photos ?? this.photos,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, uploading, deletingId, photos, error];
}
