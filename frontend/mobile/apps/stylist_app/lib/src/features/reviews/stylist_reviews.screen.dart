import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/reviews/stylist_reviews.bloc.dart';
import 'package:stylist_app/src/features/reviews/stylist_reviews.state.dart';
import 'package:stylist_app/src/features/reviews/review_dispute.sheet.dart';
import 'package:stylist_app/src/features/shared/feature_error.widget.dart';
import 'package:stylist_app/src/features/shared/load_on_init.widget.dart';

class StylistReviewsScreen extends StatelessWidget {
  const StylistReviewsScreen({super.key, required this.bloc});

  final StylistReviewsBloc bloc;

  Future<void> _dispute(BuildContext context, ReviewDto review) async {
    final messenger = ScaffoldMessenger.of(context);
    final l10n = AppLocalizations.of(context)!;
    final reason = await ReviewDisputeSheet.show(context);
    if (reason == null) return;
    if (await bloc.dispute(review.id, reason)) {
      messenger.showSnackBar(SnackBar(content: Text(l10n.reviewDisputeSent)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.stylistReviewsTitle)),
        body: BlocBuilder<StylistReviewsBloc, StylistReviewsState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.reviews.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }
            return RefreshIndicator(
              onRefresh: bloc.load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (state.error != null)
                    FeatureError(
                      error: state.error!,
                      fallbackMessage: l10n.stylistLoadFailed,
                    ),
                  if (state.reviews.isEmpty && state.error == null)
                    Text(l10n.stylistReviewsEmpty),
                  for (final review in state.reviews)
                    ListTile(
                      key: ValueKey(review.id),
                      title: Text(l10n.stylistReviewRating(review.rating)),
                      subtitle: Text(
                        [
                          if (review.authorName != null) review.authorName!,
                          if (review.body != null) review.body!,
                        ].join(' · '),
                      ),
                      trailing: _DisputeAction(
                        review: review,
                        busy: state.disputingId == review.id,
                        onDispute: () => _dispute(context, review),
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

class _DisputeAction extends StatelessWidget {
  const _DisputeAction({
    required this.review,
    required this.busy,
    required this.onDispute,
  });

  final ReviewDto review;
  final bool busy;
  final VoidCallback onDispute;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (busy) {
      return const SizedBox.square(
        dimension: 20,
        child: CircularProgressIndicator(strokeWidth: 2),
      );
    }
    if (review.disputed) return Text(l10n.reviewDisputeUnderReview);
    if (!review.published) return const SizedBox.shrink();
    return TextButton(
      onPressed: onDispute,
      child: Text(l10n.reviewDisputeAction),
    );
  }
}
