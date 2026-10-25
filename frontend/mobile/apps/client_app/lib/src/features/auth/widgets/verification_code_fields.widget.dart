import 'package:flutter/material.dart';

import 'package:client_app/src/features/auth/widgets/otp_input_field.widget.dart';

class VerificationCodeFields extends StatelessWidget {
  const VerificationCodeFields({
    super.key,
    required this.codeLength,
    required this.controllers,
    required this.focusNodes,
    required this.enabled,
    required this.hasError,
    required this.onDigitChanged,
    required this.onBackspaceWhenEmpty,
  });

  final int codeLength;
  final List<TextEditingController> controllers;
  final List<FocusNode> focusNodes;
  final bool enabled;
  final bool hasError;
  final void Function(int index, String value) onDigitChanged;
  final void Function(int index) onBackspaceWhenEmpty;

  @override
  Widget build(BuildContext context) => Row(
    children: [
      for (var i = 0; i < codeLength; i++) ...[
        if (i > 0) const SizedBox(width: 8),
        Expanded(
          child: OtpInputField(
            controller: controllers[i],
            focusNode: focusNodes[i],
            autofocus: i == 0,
            enabled: enabled,
            hasError: hasError,
            onChanged: (value) => onDigitChanged(i, value),
            onBackspaceWhenEmpty: () => onBackspaceWhenEmpty(i),
          ),
        ),
      ],
    ],
  );
}
