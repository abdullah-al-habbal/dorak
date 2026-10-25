import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/errors/api_error.entity.dart';
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
                StylistSignUpStep.form => _SignUpFormStep(
                  formKey: _formKey,
                  name: _name,
                  email: _email,
                  password: _password,
                  confirmation: _confirmation,
                  isFreelancer: _isFreelancer,
                  onFreelancerChanged: (value) =>
                      setState(() => _isFreelancer = value),
                  state: state,
                  l10n: l10n,
                  onSubmit: _register,
                  onBackToLogin: _backToLogin,
                ),
                StylistSignUpStep.verifyEmail => _VerifyEmailStep(
                  formKey: _codeFormKey,
                  code: _code,
                  state: state,
                  l10n: l10n,
                  onVerify: _verify,
                  onResend: widget.signUp.resendCode,
                  onSkip: widget.signUp.skipVerification,
                ),
                StylistSignUpStep.pending => _PendingApprovalStep(
                  l10n: l10n,
                  onBackToLogin: _backToLogin,
                ),
              },
            ),
          ),
        ),
      ),
    );
  }
}

Widget _stepHeading(BuildContext context, String title, String subtitle) {
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
        style: DorakTypography.bodyLg.copyWith(color: colors.onSurfaceVariant),
      ),
      const SizedBox(height: DorakDimensions.spacingLarge),
    ],
  );
}

String _signUpErrorMessage(Object error, AppLocalizations l10n) {
  final apiError = ApiError.from(error, l10n);
  if (apiError.errorsFor('email') != null) return l10n.stylistSignUpEmailTaken;
  if (apiError.errorsFor('code') != null) return l10n.verifyErrorInvalid;
  return apiError.message;
}

class _SignUpFormStep extends StatelessWidget {
  const _SignUpFormStep({
    required this.formKey,
    required this.name,
    required this.email,
    required this.password,
    required this.confirmation,
    required this.isFreelancer,
    required this.onFreelancerChanged,
    required this.state,
    required this.l10n,
    required this.onSubmit,
    required this.onBackToLogin,
  });

  final GlobalKey<FormState> formKey;
  final TextEditingController name;
  final TextEditingController email;
  final TextEditingController password;
  final TextEditingController confirmation;
  final bool isFreelancer;
  final ValueChanged<bool> onFreelancerChanged;
  final StylistSignUpState state;
  final AppLocalizations l10n;
  final VoidCallback onSubmit;
  final VoidCallback onBackToLogin;

  @override
  Widget build(BuildContext context) => Form(
    key: formKey,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _stepHeading(
          context,
          l10n.stylistSignUpTitle,
          l10n.stylistSignUpSubtitle,
        ),
        TextFormField(
          controller: name,
          textInputAction: TextInputAction.next,
          decoration: InputDecoration(labelText: l10n.signUpFullNameLabel),
          validator: (value) =>
              value == null || value.trim().isEmpty ? l10n.fieldRequired : null,
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        TextFormField(
          controller: email,
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
          controller: password,
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
          controller: confirmation,
          obscureText: true,
          textInputAction: TextInputAction.done,
          decoration: InputDecoration(
            labelText: l10n.signUpConfirmPasswordLabel,
          ),
          validator: (value) =>
              value != password.text ? l10n.fieldPasswordMismatch : null,
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(l10n.stylistSignUpFreelancerLabel),
          value: isFreelancer,
          onChanged: onFreelancerChanged,
        ),
        if (state.error != null) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          StatusBanner(message: _signUpErrorMessage(state.error!, l10n)),
        ],
        const SizedBox(height: DorakDimensions.spacingLarge),
        PrimaryButton(
          label: l10n.signUpButton,
          isLoading: state.isSubmitting,
          onPressed: onSubmit,
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        TextButton(
          onPressed: onBackToLogin,
          child: Text(
            '${l10n.signUpAlreadyHaveAccount} ${l10n.signUpLogInLink}',
          ),
        ),
      ],
    ),
  );
}

class _VerifyEmailStep extends StatelessWidget {
  const _VerifyEmailStep({
    required this.formKey,
    required this.code,
    required this.state,
    required this.l10n,
    required this.onVerify,
    required this.onResend,
    required this.onSkip,
  });

  final GlobalKey<FormState> formKey;
  final TextEditingController code;
  final StylistSignUpState state;
  final AppLocalizations l10n;
  final VoidCallback onVerify;
  final VoidCallback onResend;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) => Form(
    key: formKey,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _stepHeading(context, l10n.verifyTitle, l10n.verifySubtitle(state.email)),
        TextFormField(
          controller: code,
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: InputDecoration(labelText: l10n.stylistVerifyCodeLabel),
          validator: (value) => value == null || value.trim().length != 6
              ? l10n.verifyErrorInvalid
              : null,
        ),
        if (state.error != null) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          StatusBanner(message: _signUpErrorMessage(state.error!, l10n)),
        ] else if (state.codeResent) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          Text(l10n.stylistVerifyCodeResent),
        ],
        const SizedBox(height: DorakDimensions.spacingLarge),
        PrimaryButton(
          label: l10n.verifyButton,
          isLoading: state.isSubmitting,
          onPressed: onVerify,
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        TextButton(
          onPressed: state.isSubmitting ? null : onResend,
          child: Text(l10n.verifyResend),
        ),
        TextButton(
          onPressed: state.isSubmitting ? null : onSkip,
          child: Text(l10n.verifySkip),
        ),
      ],
    ),
  );
}

class _PendingApprovalStep extends StatelessWidget {
  const _PendingApprovalStep({required this.l10n, required this.onBackToLogin});

  final AppLocalizations l10n;
  final VoidCallback onBackToLogin;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      _stepHeading(
        context,
        l10n.stylistPendingTitle,
        l10n.stylistPendingMessage,
      ),
      PrimaryButton(
        label: l10n.stylistPendingBackToLogin,
        onPressed: onBackToLogin,
      ),
    ],
  );
}
