import 'package:core/src/network/api.client.dart';
import 'package:core/src/network/dto/feedback_report_request.dto.dart';
import 'package:core/src/network/endpoints/feedback.endpoints.dart';

abstract class FeedbackRepository {
  /// Sends one report. Throws an `ApiException` on a validation error (422), a
  /// rate limit (429) or a network failure; nothing is stored locally.
  Future<void> submit(FeedbackReportRequestDto report);
}

class DioFeedbackRepository implements FeedbackRepository {
  const DioFeedbackRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<void> submit(FeedbackReportRequestDto report) => _apiClient.post<void>(
    FeedbackEndpoints.submit,
    data: report.toJson(),
    parser: (_) {},
  );
}
