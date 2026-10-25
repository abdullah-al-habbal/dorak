import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\ClientFaceProfile\Enums\FaceAnalysisStatusEnum`
/// PHP enum. Not to be confused with the app-level `FaceAnalysisStatus` UI
/// state machine, which tracks screen state rather than the wire value.
enum FaceProfileAnalysisStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('completed')
  completed,
  @JsonValue('failed')
  failed;

  static FaceProfileAnalysisStatus fromValue(String value) => switch (value) {
    'pending' => FaceProfileAnalysisStatus.pending,
    'completed' => FaceProfileAnalysisStatus.completed,
    'failed' => FaceProfileAnalysisStatus.failed,
    _ => throw ArgumentError('Unknown face analysis status: $value'),
  };

  String get value => switch (this) {
    FaceProfileAnalysisStatus.pending => 'pending',
    FaceProfileAnalysisStatus.completed => 'completed',
    FaceProfileAnalysisStatus.failed => 'failed',
  };
}
