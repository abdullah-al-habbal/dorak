import 'package:flutter/material.dart';

import 'package:design_system/src/tokens/tokens.barrel.dart';
import 'package:design_system/src/widgets/primary_button.widget.dart';
import 'package:design_system/src/widgets/status_banner.widget.dart';

/// One choice in the feedback type selector; [id] is what the caller gets back.
class FeedbackKindOption {
  const FeedbackKindOption({required this.id, required this.label});

  final String id;
  final String label;
}

/// Every string the form shows. The package never resolves text itself.
class FeedbackFormLabels {
  const FeedbackFormLabels({
    required this.kindLabel,
    required this.messageLabel,
    required this.messageHint,
    required this.messageTooShort,
    required this.emailLabel,
    required this.emailInvalid,
    required this.submitLabel,
  });

  final String kindLabel;
  final String messageLabel;
  final String messageHint;
  final String messageTooShort;
  final String emailLabel;
  final String emailInvalid;
  final String submitLabel;
}

/// What the user typed, ready for the caller to turn into a request.
class FeedbackFormValues {
  const FeedbackFormValues({
    required this.kindId,
    required this.message,
    this.email,
  });

  final String kindId;
  final String message;
  final String? email;
}

/// A suggestion, bug or support form: a type selector, a message and, for a guest,
/// an email. It validates length and shape locally and reports through [onSubmit];
/// sending, retry and the result are the caller's job ([errorMessage], [isSending]).
class FeedbackForm extends StatefulWidget {
  const FeedbackForm({
    super.key,
    required this.kinds,
    required this.labels,
    required this.onSubmit,
    this.initialKindId,
    this.requireEmail = false,
    this.isSending = false,
    this.errorMessage,
    this.minMessageLength = 5,
    this.maxMessageLength = 2000,
  }) : assert(kinds.length > 0, 'at least one kind is required');

  final List<FeedbackKindOption> kinds;
  final FeedbackFormLabels labels;
  final ValueChanged<FeedbackFormValues> onSubmit;
  final String? initialKindId;

  /// True for a guest, who must leave an email to be answered.
  final bool requireEmail;
  final bool isSending;
  final String? errorMessage;
  final int minMessageLength;
  final int maxMessageLength;

  @override
  State<FeedbackForm> createState() => _FeedbackFormState();
}

class _FeedbackFormState extends State<FeedbackForm> {
  static final RegExp _emailShape = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

  final _formKey = GlobalKey<FormState>();
  final _message = TextEditingController();
  final _email = TextEditingController();
  late String _kindId = widget.initialKindId ?? widget.kinds.first.id;

  @override
  void dispose() {
    _message.dispose();
    _email.dispose();
    super.dispose();
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }
    final email = _email.text.trim();
    widget.onSubmit(
      FeedbackFormValues(
        kindId: _kindId,
        message: _message.text.trim(),
        email: email.isEmpty ? null : email,
      ),
    );
  }

  String? _validateMessage(String? value) =>
      (value ?? '').trim().length < widget.minMessageLength
      ? widget.labels.messageTooShort
      : null;

  String? _validateEmail(String? value) {
    final email = (value ?? '').trim();
    if (email.isEmpty) {
      return widget.requireEmail ? widget.labels.emailInvalid : null;
    }
    return _emailShape.hasMatch(email) ? null : widget.labels.emailInvalid;
  }

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    final labels = widget.labels;

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            labels.kindLabel,
            style: DorakTypography.labelLg.copyWith(color: colors.onSurface),
          ),
          const SizedBox(height: DorakDimensions.spacingSmall),
          Wrap(
            spacing: DorakDimensions.spacingSmall,
            children: [
              for (final kind in widget.kinds)
                ChoiceChip(
                  label: Text(kind.label),
                  selected: kind.id == _kindId,
                  onSelected: widget.isSending
                      ? null
                      : (_) => setState(() => _kindId = kind.id),
                ),
            ],
          ),
          const SizedBox(height: DorakDimensions.spacingMedium),
          TextFormField(
            controller: _message,
            enabled: !widget.isSending,
            minLines: 4,
            maxLines: 8,
            maxLength: widget.maxMessageLength,
            textInputAction: TextInputAction.newline,
            keyboardType: TextInputType.multiline,
            decoration: InputDecoration(
              labelText: labels.messageLabel,
              hintText: labels.messageHint,
              alignLabelWithHint: true,
            ),
            validator: _validateMessage,
          ),
          if (widget.requireEmail) ...[
            const SizedBox(height: DorakDimensions.spacingSmall),
            TextFormField(
              controller: _email,
              enabled: !widget.isSending,
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              decoration: InputDecoration(labelText: labels.emailLabel),
              validator: _validateEmail,
            ),
          ],
          if (widget.errorMessage != null) ...[
            const SizedBox(height: DorakDimensions.spacingSmall),
            StatusBanner(message: widget.errorMessage!),
          ],
          const SizedBox(height: DorakDimensions.spacingMedium),
          PrimaryButton(
            label: labels.submitLabel,
            onPressed: _submit,
            isLoading: widget.isSending,
          ),
        ],
      ),
    );
  }
}
