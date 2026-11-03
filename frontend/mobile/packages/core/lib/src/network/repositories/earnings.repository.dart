import 'package:core/core.dart';

abstract class EarningsRepository {
  /// Completed-booking totals per currency; [from] and [to] are inclusive days.
  Future<EarningsDto> getEarnings({DateTime? from, DateTime? to});
}

class DioEarningsRepository implements EarningsRepository {
  const DioEarningsRepository(this._client, this._path);

  factory DioEarningsRepository.branch(ApiClient client) =>
      DioEarningsRepository(client, ApiEndpoints.branch.earnings);

  factory DioEarningsRepository.barber(ApiClient client) =>
      DioEarningsRepository(client, ApiEndpoints.operations.barberEarnings);

  final ApiClient _client;
  final String _path;

  @override
  Future<EarningsDto> getEarnings({DateTime? from, DateTime? to}) =>
      _client.get(
        _path,
        queryParameters: {'from': ?_day(from), 'to': ?_day(to)},
        parser: (json) => EarningsDto.fromJson(json as Map<String, dynamic>),
      );

  static String? _day(DateTime? value) =>
      value?.toIso8601String().split('T').first;
}
