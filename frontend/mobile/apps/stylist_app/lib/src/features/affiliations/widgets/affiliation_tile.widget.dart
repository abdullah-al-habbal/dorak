import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class AffiliationTile extends StatelessWidget {
  const AffiliationTile({
    super.key,
    required this.affiliation,
    required this.busy,
    required this.onAccept,
    required this.onReject,
  });

  final BarberAffiliationDto affiliation;
  final bool busy;
  final VoidCallback onAccept;
  final VoidCallback onReject;

  String _statusLabel(AppLocalizations l10n) => switch (affiliation.status) {
    'pending' => l10n.stylistAffiliationStatusPending,
    'active' => l10n.stylistAffiliationStatusActive,
    'rejected' => l10n.stylistAffiliationStatusRejected,
    _ => l10n.stylistAffiliationStatusTerminated,
  };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_statusLabel(l10n)),
            if (affiliation.isPending)
              Wrap(
                spacing: 8,
                children: [
                  FilledButton(
                    onPressed: busy ? null : onAccept,
                    child: Text(l10n.stylistAffiliationAccept),
                  ),
                  OutlinedButton(
                    onPressed: busy ? null : onReject,
                    child: Text(l10n.stylistAffiliationReject),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
