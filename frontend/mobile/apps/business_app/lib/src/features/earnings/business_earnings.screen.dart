import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/earnings/business_earnings.bloc.dart';
import 'package:business_app/src/features/earnings/business_earnings.state.dart';
import 'package:business_app/src/features/earnings/earnings_range.entity.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';

class BusinessEarningsScreen extends StatelessWidget {
  const BusinessEarningsScreen({super.key, required this.bloc});

  final BusinessEarningsBloc bloc;

  String _money(int minor, String currency) =>
      '${MinorUnits.toMajor(minor).toStringAsFixed(2)} $currency';

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.staffEarningsTitle)),
        body: BlocBuilder<BusinessEarningsBloc, BusinessEarningsState>(
          bloc: bloc,
          builder: (context, state) {
            final totals = state.earnings?.totals ?? const <EarningsTotalDto>[];
            if (state.loading && state.earnings == null) {
              return const AppLoader.page();
            }
            return RefreshIndicator(
              onRefresh: bloc.load,
              child: ListView(
                padding: const EdgeInsets.all(DorakDimensions.marginMobile),
                children: [
                  Row(
                    children: [
                      ChoiceChip(
                        label: Text(l10n.staffEarningsRangeMonth),
                        selected: state.range == EarningsRange.month,
                        onSelected: (_) =>
                            bloc.selectRange(EarningsRange.month),
                      ),
                      const SizedBox(width: DorakDimensions.spacingSmall),
                      ChoiceChip(
                        label: Text(l10n.staffEarningsRangeAll),
                        selected: state.range == EarningsRange.all,
                        onSelected: (_) => bloc.selectRange(EarningsRange.all),
                      ),
                    ],
                  ),
                  if (state.error != null)
                    FeatureError(
                      error: state.error!,
                      fallbackMessage: l10n.businessUpdateFailed,
                    ),
                  if (totals.isEmpty && state.error == null)
                    Padding(
                      padding: const EdgeInsets.only(
                        top: DorakDimensions.spacingMedium,
                      ),
                      child: Text(l10n.staffEarningsEmpty),
                    ),
                  for (final total in totals)
                    Card(
                      key: ValueKey(total.currencyCode),
                      child: Padding(
                        padding: const EdgeInsets.all(
                          DorakDimensions.spacingMedium,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n.staffEarningsBookings(
                                total.completedBookingsCount,
                              ),
                              style: DorakTypography.labelLg,
                            ),
                            Text(
                              '${l10n.staffEarningsGross}: ${_money(total.grossMinor, total.currencyCode)}',
                            ),
                            if (total.commissionMinor != null)
                              Text(
                                '${l10n.staffEarningsCommission}: ${_money(total.commissionMinor!, total.currencyCode)}',
                              ),
                            Text(
                              '${l10n.staffEarningsNet}: ${total.netMinor == null ? l10n.staffEarningsNetUnavailable : _money(total.netMinor!, total.currencyCode)}',
                            ),
                          ],
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
