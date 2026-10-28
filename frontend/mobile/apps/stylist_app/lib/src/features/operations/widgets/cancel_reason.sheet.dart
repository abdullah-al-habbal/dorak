import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class CancelReasonSheet extends StatefulWidget {
  const CancelReasonSheet({super.key});

  /// Resolves to the trimmed reason, or null when the stylist keeps the booking.
  static Future<String?> show(BuildContext context) =>
      showModalBottomSheet<String>(
        context: context,
        isScrollControlled: true,
        builder: (context) => const CancelReasonSheet(),
      );

  @override
  State<CancelReasonSheet> createState() => _CancelReasonSheetState();
}

class _CancelReasonSheetState extends State<CancelReasonSheet> {
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
            Text(l10n.stylistCancelReasonTitle),
            TextFormField(
              controller: _reason,
              maxLength: 500,
              decoration: InputDecoration(
                labelText: l10n.stylistCancelReasonLabel,
              ),
              validator: (value) => value == null || value.trim().isEmpty
                  ? l10n.stylistCancelReasonRequired
                  : null,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(l10n.stylistCancelKeep),
                ),
                FilledButton(
                  onPressed: _submit,
                  child: Text(l10n.stylistCancelBooking),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
