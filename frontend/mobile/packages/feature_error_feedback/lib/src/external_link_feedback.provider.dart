import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

/// Opens a link outside the app and says so when it cannot be opened.
abstract final class ExternalLinkFeedback {
  static Future<void> open(
    BuildContext context,
    ExternalLinkOpener opener,
    Uri uri,
  ) async {
    // Read before the await: the screen may be gone when the opener answers.
    final messenger = ScaffoldMessenger.of(context);
    final failed = AppLocalizations.of(context)!.openLinkFailed;
    if (!await opener.open(uri)) {
      messenger.showSnackBar(SnackBar(content: Text(failed)));
    }
  }
}
