import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/owner/owner_billing.bloc.dart';
import 'package:business_app/src/features/owner/owner_billing.state.dart';
import 'package:business_app/src/features/owner/owner_error.entity.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';

/// Read-only plan and payouts. Changing the plan or requesting a payout is web only.
class OwnerBillingScreen extends StatelessWidget {
  const OwnerBillingScreen({super.key, required this.bloc});

  final OwnerBillingCubit bloc;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final language = Localizations.localeOf(context).languageCode;
    String named(Map<String, String> name) =>
        name[language] ?? name.values.firstOrNull ?? '';
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.ownerBillingTitle)),
        body: BlocBuilder<OwnerBillingCubit, OwnerBillingState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading) return const AppLoader.page();
            return RefreshIndicator(
              onRefresh: bloc.load,
              child: ListView(
                padding: const EdgeInsets.all(DorakDimensions.marginMobile),
                children: [
                  if (state.error != null)
                    Text(OwnerError.message(l10n, state.error!)),
                  Text(
                    l10n.ownerSubscriptionTitle,
                    style: DorakTypography.titleLg,
                  ),
                  if (state.subscriptions.isEmpty)
                    Text(l10n.ownerNoSubscription),
                  for (final subscription in state.subscriptions)
                    ListTile(
                      key: ValueKey(subscription.id),
                      contentPadding: EdgeInsets.zero,
                      title: Text(named(subscription.brandName)),
                      subtitle: Text(
                        l10n.ownerPlanLine(
                          named(subscription.plan.name),
                          subscription.status,
                        ),
                      ),
                    ),
                  const SizedBox(height: DorakDimensions.spacingLarge),
                  Text(l10n.ownerPayoutsTitle, style: DorakTypography.titleLg),
                  if (state.payouts.isEmpty) Text(l10n.ownerPayoutsEmpty),
                  for (final payout in state.payouts)
                    ListTile(
                      key: ValueKey(payout.id),
                      contentPadding: EdgeInsets.zero,
                      title: Text(
                        l10n.ownerPayoutLine(
                          MinorUnits.toMajor(
                            payout.totalAmountMinor,
                          ).toStringAsFixed(2),
                          payout.currencyCode,
                          payout.status,
                        ),
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
