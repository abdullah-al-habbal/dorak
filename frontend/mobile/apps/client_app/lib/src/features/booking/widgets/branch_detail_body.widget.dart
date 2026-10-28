import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:design_system/design_system.dart';

import 'package:client_app/src/core/formatting/rating_label.entity.dart';
import 'package:client_app/src/features/booking/branch_booking_error.entity.dart';
import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.event.dart';
import 'package:client_app/src/features/booking/branch_detail.state.dart';
import 'package:client_app/src/features/booking/widgets/barber_section.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_mode_section.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_submit_section.widget.dart';
import 'package:client_app/src/features/booking/widgets/branch_header.widget.dart';
import 'package:client_app/src/features/booking/widgets/branch_storefront.widget.dart';
import 'package:client_app/src/features/booking/widgets/payment_method_section.widget.dart';
import 'package:client_app/src/features/booking/widgets/service_selection_section.widget.dart';

class BranchDetailBody extends StatelessWidget {
  const BranchDetailBody({
    super.key,
    required this.bloc,
    required this.state,
    required this.onBarberSelected,
    required this.onFavorite,
    required this.onViewReviews,
  });
  final BranchDetailBloc bloc;
  final BranchDetailState state;
  final void Function(String barberId) onBarberSelected;
  final void Function(String favorableId, String favorableType) onFavorite;
  final VoidCallback onViewReviews;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final detail = state.detail!;
    return ListView(
      padding: const EdgeInsets.all(DorakDimensions.marginMobile),
      children: [
        BranchHeader(
          detail: detail,
          colors: colors,
          chairsLabel: l10n.branchChairsCount(detail.chairsCount),
          ratingLabel: RatingLabel.of(
            l10n,
            average: detail.ratingAvg,
            count: detail.ratingCount,
            localeCode: Localizations.localeOf(context).languageCode,
          ),
          onFavorite: onFavorite,
        ),
        BranchStorefront(detail: detail),
        SecondaryButton(
          label: l10n.branchReviewsTitle,
          onPressed: onViewReviews,
        ),
        const SizedBox(height: DorakDimensions.spacingLarge),
        BookingModeSection(
          bloc: bloc,
          state: state,
          l10n: l10n,
          colors: colors,
        ),
        if (detail.barbers.isNotEmpty)
          BarberSection(
            bloc: bloc,
            state: state,
            detail: detail,
            l10n: l10n,
            onBarberSelected: onBarberSelected,
            onFavorite: onFavorite,
          ),
        if (detail.services.isNotEmpty)
          ServiceSelectionSection(
            bloc: bloc,
            state: state,
            services: detail.services,
            l10n: l10n,
            colors: colors,
          ),
        PaymentMethodSection(l10n: l10n),
        const SizedBox(height: DorakDimensions.spacingLarge),
        BookingSubmitSection(
          bloc: bloc,
          state: state,
          l10n: l10n,
          submitMessage: _submitMessage(context),
          onPickDate: () => _pickDate(context),
          onSubmit: () => bloc.add(const BranchDetailBookingSubmitted()),
        ),
      ],
    );
  }

  String _submitMessage(BuildContext context) =>
      BranchBookingError.submitMessage(
        AppLocalizations.of(context)!,
        state.submitError,
      );

  Future<void> _pickDate(BuildContext context) async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 60)),
    );
    if (date == null || !context.mounted) return;
    bloc.add(BranchDetailDateChanged(date));
  }
}
