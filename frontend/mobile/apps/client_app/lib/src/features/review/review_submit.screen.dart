import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/review/review_submit.bloc.dart';
import 'package:client_app/src/features/review/review_submit.event.dart';
import 'package:client_app/src/features/review/review_submit.state.dart';
import 'package:client_app/src/features/review/widgets/review_submitted_view.widget.dart';
import 'package:client_app/src/features/review/widgets/review_submit_form.widget.dart';
import 'package:core/core.dart';

class ReviewSubmitScreen extends StatefulWidget {
  const ReviewSubmitScreen({
    super.key,
    required this.bloc,
    required this.bookingId,
    required this.onLocaleToggle,
    required this.onSubmitted,
    required this.onBack,
    required this.onViewBookings,
  });

  final ReviewSubmitBloc bloc;
  final String bookingId;
  final VoidCallback onLocaleToggle;
  final VoidCallback onSubmitted;
  final VoidCallback onBack;
  final VoidCallback onViewBookings;

  @override
  State<ReviewSubmitScreen> createState() => _ReviewSubmitScreenState();
}

class _ReviewSubmitScreenState extends State<ReviewSubmitScreen> {
  int _selectedRating = 0;
  final _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic =
        Localizations.localeOf(context).languageCode == LocaleCodes.arabic;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.reviewTitle),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
        actions: [
          LocaleSwitcher(
            label: isArabic ? l10n.localeEnglish : l10n.localeArabic,
            onPressed: widget.onLocaleToggle,
          ),
        ],
      ),
      body: BlocBuilder<ReviewSubmitBloc, ReviewSubmitState>(
        bloc: widget.bloc,
        builder: (context, state) {
          if (state.submitted) {
            return ReviewSubmittedView(
              review: state.review,
              onViewBookings: widget.onViewBookings,
            );
          }
          return ReviewSubmitForm(
            bloc: widget.bloc,
            state: state,
            selectedRating: _selectedRating,
            commentController: _commentController,
            onRatingChanged: (rating) =>
                setState(() => _selectedRating = rating),
            onSubmit: () {
              if (_selectedRating < 1 || _selectedRating > 5) return;
              widget.bloc.add(
                ReviewSubmitStarted(
                  widget.bookingId,
                  rating: _selectedRating,
                  comment: _commentController.text.trim().isEmpty
                      ? null
                      : _commentController.text.trim(),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
