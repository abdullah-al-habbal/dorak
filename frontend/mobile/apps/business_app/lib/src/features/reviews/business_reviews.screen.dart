import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/reviews/business_reviews.bloc.dart';
import 'package:business_app/src/features/reviews/business_reviews.state.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';

class BusinessReviewsScreen extends StatelessWidget {
  const BusinessReviewsScreen({super.key, required this.bloc});

  final BusinessReviewsBloc bloc;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.businessReviewsTitle)),
        body: BlocBuilder<BusinessReviewsBloc, BusinessReviewsState>(
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
                      fallbackMessage: l10n.businessLoadFailed,
                    ),
                  if (state.reviews.isEmpty && state.error == null)
                    Text(l10n.businessReviewsEmpty),
                  for (final review in state.reviews)
                    ListTile(
                      key: ValueKey(review.id),
                      title: Text(l10n.businessReviewRating(review.rating)),
                      subtitle: Text(
                        [
                          if (review.authorName != null) review.authorName!,
                          if (review.comment != null) review.comment!,
                        ].join(' · '),
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
