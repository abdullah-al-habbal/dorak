import 'package:flutter/material.dart';
import 'package:design_system/design_system.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/onboarding/widgets/booking_date_card.widget.dart';
import 'package:client_app/src/features/onboarding/widgets/booking_professional_card.widget.dart';
import 'package:client_app/src/features/onboarding/widgets/booking_service_card.widget.dart';
import 'package:client_app/src/features/onboarding/widgets/booking_visual_stagger.widget.dart';

class BookingVisual extends StatefulWidget {
  const BookingVisual({super.key});

  @override
  State<BookingVisual> createState() => _BookingVisualState();
}

class _BookingVisualState extends State<BookingVisual>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final List<Animation<double>> _staggeredAnimations;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _staggeredAnimations = List.generate(
      3,
      (index) => CurvedAnimation(
        parent: _controller,
        curve: Interval(
          0.0 + (index * 0.1),
          0.5 + (index * 0.1),
          curve: Curves.easeOut,
        ),
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);

    return SizedBox(
      height: 320,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 220,
            height: 220,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  colors.primaryFixedDim.withValues(alpha: 0.45),
                  colors.primaryFixedDim.withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              BookingVisualStagger(
                animation: _staggeredAnimations[0],
                child: BookingServiceCard(colors: colors, l10n: l10n),
              ),
              const SizedBox(height: 12),
              BookingVisualStagger(
                animation: _staggeredAnimations[1],
                child: Transform.translate(
                  offset: const Offset(24, 0),
                  child: BookingProfessionalCard(colors: colors, l10n: l10n),
                ),
              ),
              const SizedBox(height: 12),
              BookingVisualStagger(
                animation: _staggeredAnimations[2],
                child: BookingDateCard(colors: colors, l10n: l10n),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
