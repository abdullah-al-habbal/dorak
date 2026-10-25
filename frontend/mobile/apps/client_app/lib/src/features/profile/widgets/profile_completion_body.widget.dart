import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/profile_completion.state.dart';
import 'package:client_app/src/features/profile/widgets/profile_completion_form.widget.dart';
import 'package:client_app/src/features/profile/widgets/profile_completion_header.widget.dart';

class ProfileCompletionBody extends StatelessWidget {
  const ProfileCompletionBody({
    super.key,
    required this.state,
    required this.formKey,
    required this.nameController,
    required this.phoneController,
    required this.onSubmit,
    required this.errorMessage,
  });
  final ProfileCompletionState state;
  final GlobalKey<FormState> formKey;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final VoidCallback onSubmit;
  final String Function(AppLocalizations, Object) errorMessage;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 600),
        child: ListView(
          padding: const EdgeInsets.all(DorakDimensions.marginMobile),
          children: [
            ProfileCompletionHeader(l10n: l10n, colors: colors),
            const SizedBox(height: DorakDimensions.spacingLarge),
            ProfileCompletionForm(
              formKey: formKey,
              nameController: nameController,
              phoneController: phoneController,
              l10n: l10n,
            ),
            const SizedBox(height: DorakDimensions.spacingLarge),
            if (state.error != null) ...[
              StatusBanner(message: errorMessage(l10n, state.error!)),
              const SizedBox(height: DorakDimensions.spacingMedium),
            ],
            PrimaryButton(
              label: l10n.profileCompletionContinue,
              isLoading: state.isSubmitting,
              onPressed: onSubmit,
            ),
          ],
        ),
      ),
    );
  }
}
