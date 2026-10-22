import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_validators.entity.dart';
import 'package:client_app/src/features/auth/widgets/auth_text_field.widget.dart';
import 'package:client_app/src/features/profile/profile_completion.bloc.dart';
import 'package:client_app/src/features/profile/profile_completion.event.dart';
import 'package:client_app/src/features/profile/profile_completion.state.dart';

class ProfileCompletionScreen extends StatefulWidget {
  const ProfileCompletionScreen({
    super.key,
    required this.bloc,
    required this.initialName,
    required this.initialPhone,
    required this.onCompleted,
  });

  final ProfileCompletionBloc bloc;
  final String initialName;
  final String? initialPhone;
  final ValueChanged<String?> onCompleted;

  @override
  State<ProfileCompletionScreen> createState() =>
      _ProfileCompletionScreenState();
}

class _ProfileCompletionScreenState extends State<ProfileCompletionScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialName);
    _phoneController = TextEditingController(text: widget.initialPhone ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<ProfileCompletionBloc, ProfileCompletionState>(
          bloc: widget.bloc,
          listener: (context, state) {
            if (state.completed) widget.onCompleted(state.phoneToVerify);
          },
          builder: (context, state) => _ProfileCompletionBody(
            state: state,
            formKey: _formKey,
            nameController: _nameController,
            phoneController: _phoneController,
            onSubmit: _submit,
            errorMessage: _errorMessage,
          ),
        ),
      ),
    );
  }

  String _errorMessage(AppLocalizations l10n, Object error) {
    if (error is NetworkException) return l10n.errorNetwork;
    return l10n.profileCompletionError;
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    widget.bloc.add(
      ProfileCompletionSubmitted(
        name: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        currentPhone: widget.initialPhone ?? '',
      ),
    );
  }
}

class _ProfileCompletionBody extends StatelessWidget {
  const _ProfileCompletionBody({
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
            _ProfileCompletionHeader(l10n: l10n, colors: colors),
            const SizedBox(height: DorakDimensions.spacingLarge),
            _ProfileCompletionForm(
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

class _ProfileCompletionHeader extends StatelessWidget {
  const _ProfileCompletionHeader({required this.l10n, required this.colors});
  final AppLocalizations l10n;
  final DorakColors colors;
  @override
  Widget build(BuildContext context) => Column(
    children: [
      Icon(Icons.account_circle, size: 48, color: colors.primary),
      const SizedBox(height: DorakDimensions.spacingMedium),
      Text(
        l10n.profileCompletionTitle,
        style: DorakTypography.headlineLgMobile.copyWith(color: colors.primary),
        textAlign: TextAlign.center,
      ),
      const SizedBox(height: DorakDimensions.spacingSmall),
      Text(
        l10n.profileCompletionSubtitle,
        style: DorakTypography.bodyLg.copyWith(color: colors.onSurfaceVariant),
        textAlign: TextAlign.center,
      ),
    ],
  );
}

class _ProfileCompletionForm extends StatelessWidget {
  const _ProfileCompletionForm({
    required this.formKey,
    required this.nameController,
    required this.phoneController,
    required this.l10n,
  });
  final GlobalKey<FormState> formKey;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final AppLocalizations l10n;
  @override
  Widget build(BuildContext context) => Form(
    key: formKey,
    child: Column(
      children: [
        AuthTextField(
          label: l10n.profileCompletionNameLabel,
          controller: nameController,
          validator: (value) => AuthValidators.required(value, l10n),
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        AuthTextField(
          label: l10n.profileCompletionPhoneLabel,
          controller: phoneController,
          keyboardType: TextInputType.phone,
          textInputAction: TextInputAction.done,
          validator: (value) => AuthValidators.required(value, l10n),
        ),
      ],
    ),
  );
}
