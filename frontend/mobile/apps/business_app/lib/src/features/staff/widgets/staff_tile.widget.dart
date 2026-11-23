import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class StaffTile extends StatelessWidget {
  const StaffTile({
    super.key,
    required this.member,
    required this.busy,
    required this.onToggle,
  });

  final StaffMemberDto member;
  final bool busy;
  final VoidCallback onToggle;

  String _status(AppLocalizations l10n) => switch (member.status) {
    BarberStatus.enabled => l10n.businessStaffStatusEnabled,
    BarberStatus.disabled => l10n.businessStaffStatusDisabled,
    BarberStatus.pending => l10n.businessStaffStatusPending,
    BarberStatus.rejected => l10n.businessStaffStatusRejected,
  };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final rating = member.ratingAverage;
    final details = [
      _status(l10n),
      if (rating != null)
        l10n.businessStaffRating(rating.toStringAsFixed(1), member.ratingCount),
      if (member.phone != null) member.phone!,
    ].join(' · ');
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(member.name, style: DorakTypography.labelLg),
      subtitle: Text(details),
      trailing: busy
          ? const AppLoader.inline()
          : TextButton(
              onPressed: member.status == BarberStatus.pending
                  ? null
                  : onToggle,
              child: Text(
                member.isActive
                    ? l10n.businessStaffDeactivate
                    : l10n.businessStaffActivate,
              ),
            ),
    );
  }
}
