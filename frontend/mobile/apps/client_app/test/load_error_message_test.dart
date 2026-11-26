import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/errors/load_error_message.entity.dart';

void main() {
  late AppLocalizations l10n;

  setUpAll(() async {
    l10n = await AppLocalizations.delegate.load(const Locale('en'));
  });

  test('only a transport failure says there is no connection', () {
    const offline = NetworkException(
      type: DioExceptionType.connectionError,
      retryable: true,
      message: 'raw',
    );
    const gateway = ApiException(
      statusCode: 502,
      code: 'INVALID_RESPONSE',
      message: 'raw',
    );

    expect(LoadErrorMessage.of(l10n, offline), l10n.errorNetwork);
    expect(LoadErrorMessage.of(l10n, gateway), l10n.errorGeneric);
    expect(LoadErrorMessage.of(l10n, StateError('x')), l10n.errorGeneric);
  });
}
