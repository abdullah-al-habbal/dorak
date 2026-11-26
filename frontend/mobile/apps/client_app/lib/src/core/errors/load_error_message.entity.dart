import 'package:core/core.dart';
import 'package:localization/localization.dart';

/// The line shown when something could not be loaded: only a transport failure
/// is "no connection"; a server or request failure is not.
abstract final class LoadErrorMessage {
  static String of(AppLocalizations l10n, Object? error) =>
      error is NetworkException ? l10n.errorNetwork : l10n.errorGeneric;
}
