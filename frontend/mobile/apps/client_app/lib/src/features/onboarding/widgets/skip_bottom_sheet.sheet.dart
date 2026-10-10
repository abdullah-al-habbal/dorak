import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:client_app/src/features/onboarding/widgets/skip_bottom_sheet_content.widget.dart';

class SkipBottomSheet {
  static Future<void> show(
    BuildContext context, {
    required VoidCallback onSkipForNow,
    required VoidCallback onDontShowAgain,
    required VoidCallback onCancel,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => SkipBottomSheetContent(
        onSkipForNow: () {
          sheetContext.pop();
          onSkipForNow();
        },
        onDontShowAgain: () {
          sheetContext.pop();
          onDontShowAgain();
        },
        onCancel: onCancel,
      ),
    );
  }
}
