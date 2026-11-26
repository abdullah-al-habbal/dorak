import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/reviews/branch_reviews.bloc.dart';
import 'package:client_app/src/features/reviews/widgets/review_tile.widget.dart';
import 'package:client_app/src/core/errors/load_error_message.entity.dart';

class BranchReviewsScreen extends StatefulWidget {
  const BranchReviewsScreen({
    super.key,
    required this.bloc,
    required this.branchId,
  });

  final BranchReviewsBloc bloc;
  final String branchId;

  @override
  State<BranchReviewsScreen> createState() => _BranchReviewsScreenState();
}

class _BranchReviewsScreenState extends State<BranchReviewsScreen> {
  @override
  void initState() {
    super.initState();
    widget.bloc.load(widget.branchId);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeCode = Localizations.localeOf(context).languageCode;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.branchReviewsTitle)),
      body: BlocBuilder<BranchReviewsBloc, Paged<ReviewDto>>(
        bloc: widget.bloc,
        builder: (context, state) {
          if (state.hasFailedFirst) {
            return StatusView(
              icon: Icons.error_outline,
              title: l10n.errorTitleGeneric,
              message: LoadErrorMessage.of(l10n, state.error),
              actionLabel: l10n.actionRetry,
              onAction: widget.bloc.retry,
            );
          }
          if (state.isFirstLoad) return const AppLoader.page();
          if (state.isEmpty) {
            return StatusView(
              icon: Icons.rate_review_outlined,
              title: l10n.branchReviewsEmptyTitle,
              message: l10n.branchReviewsEmptyMessage,
            );
          }
          return ListView(
            padding: const EdgeInsets.all(DorakDimensions.marginMobile),
            children: [
              for (final review in state.items)
                Padding(
                  padding: const EdgeInsets.only(
                    bottom: DorakDimensions.spacingSmall,
                  ),
                  child: ReviewTile(review: review, localeCode: localeCode),
                ),
              if (state.hasMore)
                SecondaryButton(
                  label: l10n.branchReviewsLoadMore,
                  onPressed: widget.bloc.loadMore,
                ),
            ],
          );
        },
      ),
    );
  }
}
