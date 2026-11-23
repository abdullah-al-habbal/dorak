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
    BarberAffiliationStatus.pending => l10n.businessAffiliationStatusPending,
    BarberAffiliationStatus.active => l10n.businessAffiliationStatusActive,
    BarberAffiliationStatus.rejected => l10n.businessAffiliationStatusRejected,
    BarberAffiliationStatus.terminated => l10n.businessAffiliationStatusTerminated,
    BarberAffiliationStatus.unknown => l10n.affiliationStatusUnknown,
  };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: ListTile(
        title: Text(affiliation.barberId),
        subtitle: Text(_statusLabel(l10n)),
        trailing: affiliation.isPending
            ? Wrap(
                children: [
                  TextButton(
                    onPressed: busy ? null : onAccept,
                    child: Text(l10n.businessAffiliationAccept),
                  ),
                  TextButton(
                    onPressed: busy ? null : onReject,
                    child: Text(l10n.businessAffiliationReject),
                  ),
                ],
              )
            : null,
      ),
    );
  }
}
