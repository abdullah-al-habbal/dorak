import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class ReviewDisputeSheet extends StatefulWidget {
  const ReviewDisputeSheet({super.key});

  /// Resolves to the trimmed reason, or null when the stylist backs out.
  static Future<String?> show(BuildContext context) =>
      showModalBottomSheet<String>(
        context: context,
        isScrollControlled: true,
        builder: (context) => const ReviewDisputeSheet(),
      );

  @override
  State<ReviewDisputeSheet> createState() => _ReviewDisputeSheetState();
}

class _ReviewDisputeSheetState extends State<ReviewDisputeSheet> {
  final _formKey = GlobalKey<FormState>();
  final _reason = TextEditingController();

  @override
  void dispose() {
    _reason.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState?.validate() != true) return;
    Navigator.of(context).pop(_reason.text.trim());
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Padding(
      padding: EdgeInsets.fromLTRB(
        16,
        16,
        16,
        16 + MediaQuery.viewInsetsOf(context).bottom,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.reviewDisputeTitle),
            TextFormField(
              controller: _reason,
              maxLength: ReviewDisputeLimits.maxReasonLength,
              maxLines: 4,
              decoration: InputDecoration(
                labelText: l10n.reviewDisputeReasonLabel,
              ),
              validator: (value) =>
                  (value?.trim().length ?? 0) <
                      ReviewDisputeLimits.minReasonLength
                  ? l10n.reviewDisputeReasonTooShort(
                      ReviewDisputeLimits.minReasonLength,
                    )
                  : null,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(l10n.reviewDisputeCancel),
                ),
                FilledButton(
                  onPressed: _submit,
                  child: Text(l10n.reviewDisputeSubmit),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
