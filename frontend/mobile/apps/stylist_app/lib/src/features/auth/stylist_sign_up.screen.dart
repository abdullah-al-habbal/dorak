import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.state.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up_step.entity.dart';

class StylistSignUpScreen extends StatefulWidget {
  const StylistSignUpScreen({
    super.key,
    required this.signUp,
    required this.onBackToLogin,
    required this.onLocaleToggle,
  });

  final StylistSignUpBloc signUp;
  final VoidCallback onBackToLogin;
  final VoidCallback onLocaleToggle;

  @override
  State<StylistSignUpScreen> createState() => _StylistSignUpScreenState();
}

class _StylistSignUpScreenState extends State<StylistSignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _codeFormKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirmation = TextEditingController();
  final _code = TextEditingController();
  bool _isFreelancer = true;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirmation.dispose();
    _code.dispose();
    super.dispose();
  }

  void _register() {
    if (_formKey.currentState?.validate() != true) return;
    widget.signUp.register(
      name: _name.text.trim(),
      email: _email.text.trim(),
      password: _password.text,
      passwordConfirmation: _confirmation.text,
      isFreelancer: _isFreelancer,
    );
  }

  void _verify() {
    if (_codeFormKey.currentState?.validate() != true) return;
    widget.signUp.verifyEmail(_code.text.trim());
  }

  void _backToLogin() {
    widget.signUp.reset();
    widget.onBackToLogin();
  }

  String _errorMessage(Object error, AppLocalizations l10n) {
    if (error is NetworkException) return l10n.errorNetwork;
    if (error is ValidationException) {
      if (error.errors.containsKey('email')) {
        return l10n.stylistSignUpEmailTaken;
      }
      if (error.errors.containsKey('code')) return l10n.verifyErrorInvalid;
    }
    return l10n.errorGeneric;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: _backToLogin),
        actions: [
          TextButton(
            onPressed: widget.onLocaleToggle,
            child: Text(
              Localizations.localeOf(context).languageCode == 'en'
                  ? l10n.localeArabic
                  : l10n.localeEnglish,
            ),
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(DorakDimensions.marginMobile),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: BlocBuilder<StylistSignUpBloc, StylistSignUpState>(
              bloc: widget.signUp,
              builder: (context, state) => switch (state.step) {
                StylistSignUpStep.form => _buildForm(context, state, l10n),
                StylistSignUpStep.verifyEmail => _buildVerify(
                  context,
                  state,
                  l10n,
                ),
                StylistSignUpStep.pending => _buildPending(context, l10n),
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _heading(BuildContext context, String title, String subtitle) {
    final colors = DorakColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          title,
          style: DorakTypography.headlineLgMobile.copyWith(
            color: colors.onSurface,
          ),
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        Text(
          subtitle,
          style: DorakTypography.bodyLg.copyWith(
            color: colors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: DorakDimensions.spacingLarge),
      ],
    );
  }

  Widget _buildForm(
    BuildContext context,
    StylistSignUpState state,
    AppLocalizations l10n,
  ) => Form(
    key: _formKey,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _heading(context, l10n.stylistSignUpTitle, l10n.stylistSignUpSubtitle),
        TextFormField(
          controller: _name,
          textInputAction: TextInputAction.next,
          decoration: InputDecoration(labelText: l10n.signUpFullNameLabel),
          validator: (value) =>
              value == null || value.trim().isEmpty ? l10n.fieldRequired : null,
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        TextFormField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          decoration: InputDecoration(labelText: l10n.signUpEmailLabel),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.fieldRequired;
            }
            if (!value.contains('@') || !value.contains('.')) {
              return l10n.fieldInvalidEmail;
            }
            return null;
          },
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        TextFormField(
          controller: _password,
          obscureText: true,
          textInputAction: TextInputAction.next,
          decoration: InputDecoration(
            labelText: l10n.signUpPasswordLabel,
            helperText: l10n.signUpPasswordHint,
          ),
          validator: (value) {
            if (value == null || value.isEmpty) return l10n.fieldRequired;
            if (value.length < 8) return l10n.fieldPasswordTooShort;
            return null;
          },
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        TextFormField(
          controller: _confirmation,
          obscureText: true,
          textInputAction: TextInputAction.done,
          decoration: InputDecoration(
            labelText: l10n.signUpConfirmPasswordLabel,
          ),
          validator: (value) =>
              value != _password.text ? l10n.fieldPasswordMismatch : null,
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(l10n.stylistSignUpFreelancerLabel),
          value: _isFreelancer,
          onChanged: (value) => setState(() => _isFreelancer = value),
        ),
        if (state.error != null) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          StatusBanner(message: _errorMessage(state.error!, l10n)),
        ],
        const SizedBox(height: DorakDimensions.spacingLarge),
        PrimaryButton(
          label: l10n.signUpButton,
          isLoading: state.isSubmitting,
          onPressed: _register,
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        TextButton(
          onPressed: _backToLogin,
          child: Text(
            '${l10n.signUpAlreadyHaveAccount} ${l10n.signUpLogInLink}',
          ),
        ),
      ],
    ),
  );

  Widget _buildVerify(
    BuildContext context,
    StylistSignUpState state,
    AppLocalizations l10n,
  ) => Form(
    key: _codeFormKey,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _heading(context, l10n.verifyTitle, l10n.verifySubtitle(state.email)),
        TextFormField(
          controller: _code,
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: InputDecoration(labelText: l10n.stylistVerifyCodeLabel),
          validator: (value) => value == null || value.trim().length != 6
              ? l10n.verifyErrorInvalid
              : null,
        ),
        if (state.error != null) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          StatusBanner(message: _errorMessage(state.error!, l10n)),
        ] else if (state.codeResent) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          Text(l10n.stylistVerifyCodeResent),
        ],
        const SizedBox(height: DorakDimensions.spacingLarge),
        PrimaryButton(
          label: l10n.verifyButton,
          isLoading: state.isSubmitting,
          onPressed: _verify,
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        TextButton(
          onPressed: state.isSubmitting ? null : widget.signUp.resendCode,
          child: Text(l10n.verifyResend),
        ),
        TextButton(
          onPressed: state.isSubmitting ? null : widget.signUp.skipVerification,
          child: Text(l10n.verifySkip),
        ),
      ],
    ),
  );

  Widget _buildPending(BuildContext context, AppLocalizations l10n) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      _heading(context, l10n.stylistPendingTitle, l10n.stylistPendingMessage),
      PrimaryButton(
        label: l10n.stylistPendingBackToLogin,
        onPressed: _backToLogin,
      ),
    ],
  );
}
