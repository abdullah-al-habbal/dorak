import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/history_media_type.entity.dart';

/// Lets the client choose whether a history photo is a before, after or
/// reference shot. Pops with the chosen [HistoryMediaType] value.
class HistoryMediaTypeSheet extends StatefulWidget {
  const HistoryMediaTypeSheet({super.key});

  /// Returns the chosen type, or null when the sheet is dismissed.
  static Future<String?> show(BuildContext context) =>
      showModalBottomSheet<String>(
        context: context,
        isScrollControlled: true,
        builder: (_) => const HistoryMediaTypeSheet(),
      );

  @override
  State<HistoryMediaTypeSheet> createState() => _HistoryMediaTypeSheetState();
}

class _HistoryMediaTypeSheetState extends State<HistoryMediaTypeSheet> {
  String _selected = HistoryMediaType.after;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final labels = <String, String>{
      HistoryMediaType.before: l10n.historyMediaTypeBefore,
      HistoryMediaType.after: l10n.historyMediaTypeAfter,
      HistoryMediaType.reference: l10n.historyMediaTypeReference,
    };
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(DorakDimensions.marginMobile),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(l10n.historyMediaTypeTitle, style: DorakTypography.titleLg),
            RadioGroup<String>(
              groupValue: _selected,
              onChanged: (value) =>
                  setState(() => _selected = value ?? _selected),
              child: Column(
                children: [
                  for (final entry in labels.entries)
                    RadioListTile<String>(
                      contentPadding: EdgeInsets.zero,
                      value: entry.key,
                      title: Text(entry.value),
                    ),
                ],
              ),
            ),
            PrimaryButton(
              label: l10n.historyMediaTypeContinue,
              onPressed: () => Navigator.of(context).pop(_selected),
            ),
          ],
        ),
      ),
    );
  }
}
