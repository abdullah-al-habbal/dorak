import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_error.entity.dart';
import 'package:client_app/src/features/auth/widgets/auth_text_field.widget.dart';
import 'package:client_app/src/features/profile/phone_verification.bloc.dart';
import 'package:client_app/src/features/profile/phone_verification.event.dart';
import 'package:client_app/src/features/profile/phone_verification.state.dart';
import 'package:client_app/src/features/profile/phone_verification_status.entity.dart';

class PhoneVerificationScreen extends StatefulWidget {
  const PhoneVerificationScreen({
    super.key,
    required this.bloc,
    required this.onVerified,
    required this.onSkip,
  });

  static const int codeLength = 6;

  final PhoneVerificationBloc bloc;
  final ValueChanged<ClientDto> onVerified;
  final VoidCallback onSkip;

  @override
  State<PhoneVerificationScreen> createState() =>
      _PhoneVerificationScreenState();
}

class _PhoneVerificationScreenState extends State<PhoneVerificationScreen> {
  final _code = TextEditingController();
  String? _incomplete;

  @override
  void initState() {
    super.initState();
    widget.bloc.add(const PhoneVerificationRequested());
  }

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  void _submit(AppLocalizations l10n) {
    final code = _code.text.trim();
    if (code.length != PhoneVerificationScreen.codeLength) {
      setState(() => _incomplete = l10n.phoneVerifyIncomplete);
      return;
    }
    setState(() => _incomplete = null);
    widget.bloc.add(PhoneVerificationSubmitted(code));
  }

  String _errorMessage(AppLocalizations l10n, PhoneVerificationState state) {
    final error = state.error!;
    if (error is ApiException && error.isRateLimited) {
      return l10n.phoneVerifyThrottled;
    }
    final rejected = state.status == PhoneVerificationStatus.verifyFailed
        ? l10n.phoneVerifyInvalidCode
        : l10n.phoneVerifyPhoneRejected;
    return AuthError.from(error, l10n, unprocessableMessage: rejected).message;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l10n.phoneVerifyTitle)),
      body: SafeArea(
        child: BlocConsumer<PhoneVerificationBloc, PhoneVerificationState>(
          bloc: widget.bloc,
          listenWhen: (previous, current) => previous.status != current.status,
          listener: (context, state) {
            final client = state.client;
            if (state.status == PhoneVerificationStatus.verified &&
                client != null) {
              widget.onVerified(client);
            }
          },
          builder: (context, state) {
            final failed =
                state.error != null &&
                (state.status == PhoneVerificationStatus.requestFailed ||
                    state.status == PhoneVerificationStatus.verifyFailed);
            return ListView(
              padding: const EdgeInsets.all(DorakDimensions.marginMobile),
              children: [
                Text(
                  l10n.phoneVerifySubtitle(state.phone),
                  style: DorakTypography.bodyLg.copyWith(
                    color: colors.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: DorakDimensions.spacingLarge),
                AuthTextField(
                  label: l10n.phoneVerifyCodeLabel,
                  controller: _code,
                  keyboardType: TextInputType.number,
                  textInputAction: TextInputAction.done,
                  enabled: !state.isBusy,
                  helperText: _incomplete,
                  onSubmitted: (_) => _submit(l10n),
                ),
                if (failed) ...[
                  const SizedBox(height: DorakDimensions.spacingMedium),
                  StatusBanner(message: _errorMessage(l10n, state)),
                ],
                const SizedBox(height: DorakDimensions.spacingLarge),
                PrimaryButton(
                  label: l10n.phoneVerifyButton,
                  isLoading: state.status == PhoneVerificationStatus.verifying,
                  isDisabled: state.isBusy,
                  onPressed: () => _submit(l10n),
                ),
                const SizedBox(height: DorakDimensions.spacingSmall),
                SecondaryButton(
                  label: l10n.phoneVerifyResend,
                  isDisabled: state.isBusy,
                  onPressed: () =>
                      widget.bloc.add(const PhoneVerificationRequested()),
                ),
                const SizedBox(height: DorakDimensions.spacingSmall),
                SkipButton(
                  label: l10n.phoneVerifySkip,
                  onPressed: widget.onSkip,
                  isDisabled: state.isBusy,
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
