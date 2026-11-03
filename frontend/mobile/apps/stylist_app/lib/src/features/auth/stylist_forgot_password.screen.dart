import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/errors/api_error.entity.dart';

class StylistForgotPasswordScreen extends StatefulWidget {
  const StylistForgotPasswordScreen({
    super.key,
    required this.bloc,
    required this.onBackToLogin,
  });

  final StaffPasswordResetBloc bloc;
  final VoidCallback onBackToLogin;

  @override
  State<StylistForgotPasswordScreen> createState() =>
      _StylistForgotPasswordScreenState();
}

class _StylistForgotPasswordScreenState
    extends State<StylistForgotPasswordScreen> {
  static const int _codeLength = 6;
  static const int _minPasswordLength = 8;

  final _emailKey = GlobalKey<FormState>();
  final _resetKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _code = TextEditingController();
  final _password = TextEditingController();
  final _confirmation = TextEditingController();

  @override
  void initState() {
    super.initState();
    widget.bloc.restart();
  }

  @override
  void dispose() {
    _email.dispose();
    _code.dispose();
    _password.dispose();
    _confirmation.dispose();
    super.dispose();
  }

  void _requestCode() {
    if (_emailKey.currentState?.validate() != true) return;
    widget.bloc.requestCode(_email.text.trim());
  }

  void _reset() {
    if (_resetKey.currentState?.validate() != true) return;
    widget.bloc.resetPassword(
      code: _code.text.trim(),
      password: _password.text,
      passwordConfirmation: _confirmation.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.recoveryEmailTitle)),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(DorakDimensions.marginMobile),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: BlocBuilder<StaffPasswordResetBloc, StaffPasswordResetState>(
              bloc: widget.bloc,
              builder: (context, state) => switch (state.step) {
                StaffPasswordResetStep.email => _emailStep(l10n, state),
                StaffPasswordResetStep.code => _codeStep(l10n, state),
                StaffPasswordResetStep.done => _doneStep(l10n),
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _error(
    AppLocalizations l10n,
    StaffPasswordResetState state,
    String fallback,
  ) {
    if (state.error == null) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: DorakDimensions.spacingMedium),
      child: StatusBanner(
        message: ApiError.from(
          state.error!,
          l10n,
          fallbackMessage: fallback,
        ).message,
      ),
    );
  }

  Widget _emailStep(AppLocalizations l10n, StaffPasswordResetState state) =>
      Form(
        key: _emailKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(l10n.recoveryEmailSubtitle),
            const SizedBox(height: DorakDimensions.spacingMedium),
            TextFormField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.done,
              onFieldSubmitted: (_) => _requestCode(),
              decoration: InputDecoration(labelText: l10n.recoveryEmailLabel),
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
            _error(l10n, state, l10n.errorGeneric),
            const SizedBox(height: DorakDimensions.spacingLarge),
            PrimaryButton(
              label: l10n.recoverySendCodeButton,
              isLoading: state.isSubmitting,
              onPressed: _requestCode,
            ),
            TextButton(
              onPressed: widget.onBackToLogin,
              child: Text(l10n.recoveryReturnToLogIn),
            ),
          ],
        ),
      );

  Widget _codeStep(AppLocalizations l10n, StaffPasswordResetState state) =>
      Form(
        key: _resetKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(l10n.recoveryOtpSubtitle(state.email)),
            const SizedBox(height: DorakDimensions.spacingMedium),
            TextFormField(
              controller: _code,
              keyboardType: TextInputType.number,
              maxLength: _codeLength,
              decoration: InputDecoration(labelText: l10n.recoveryOtpTitle),
              validator: (value) => (value?.trim().length ?? 0) == _codeLength
                  ? null
                  : l10n.recoveryOtpIncomplete,
            ),
            TextFormField(
              controller: _password,
              obscureText: true,
              decoration: InputDecoration(
                labelText: l10n.recoveryNewPasswordLabel,
              ),
              validator: (value) => (value?.length ?? 0) >= _minPasswordLength
                  ? null
                  : l10n.fieldPasswordTooShort,
            ),
            const SizedBox(height: DorakDimensions.spacingMedium),
            TextFormField(
              controller: _confirmation,
              obscureText: true,
              textInputAction: TextInputAction.done,
              onFieldSubmitted: (_) => _reset(),
              decoration: InputDecoration(
                labelText: l10n.recoveryConfirmPasswordLabel,
              ),
              validator: (value) =>
                  value == _password.text ? null : l10n.fieldPasswordMismatch,
            ),
            _error(l10n, state, l10n.recoveryCodeRejected),
            const SizedBox(height: DorakDimensions.spacingLarge),
            PrimaryButton(
              label: l10n.recoveryResetButton,
              isLoading: state.isSubmitting,
              onPressed: _reset,
            ),
            TextButton(
              onPressed: state.isSubmitting
                  ? null
                  : () => widget.bloc.requestCode(state.email),
              child: Text(l10n.recoveryResend),
            ),
          ],
        ),
      );

  Widget _doneStep(AppLocalizations l10n) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text(l10n.passwordResetSuccessTitle, style: DorakTypography.titleLg),
      const SizedBox(height: DorakDimensions.spacingSmall),
      Text(l10n.passwordResetSuccessMessage),
      const SizedBox(height: DorakDimensions.spacingLarge),
      PrimaryButton(
        label: l10n.recoveryReturnToLogIn,
        onPressed: widget.onBackToLogin,
      ),
    ],
  );
}
