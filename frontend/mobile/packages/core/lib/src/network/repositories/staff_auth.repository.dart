import 'package:core/src/network/api.client.dart';
import 'package:core/src/network/dto/token_response.dto.dart';

abstract class StaffAuthRepository {
  Future<String> login({required String email, required String password});
}

class DioStaffAuthRepository implements StaffAuthRepository {
  const DioStaffAuthRepository(this._client, this._loginEndpoint);

  final ApiClient _client;
  final String _loginEndpoint;

  @override
  Future<String> login({
    required String email,
    required String password,
  }) async {
    final response = await _client.post(
      _loginEndpoint,
      data: {'email': email, 'password': password},
      parser: (json) => TokenResponseDto.fromJson(json as Map<String, dynamic>),
    );
    if (response.token.isEmpty) {
      throw const FormatException('Authentication response has no token');
    }
    return response.token;
  }
}
