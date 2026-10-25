import 'package:flutter/material.dart';
import 'package:design_system/design_system.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/onboarding/widgets/ai_face_card.widget.dart';
import 'package:client_app/src/features/onboarding/widgets/ai_orbit_background.widget.dart';
import 'package:client_app/src/features/onboarding/widgets/recommendation_card.widget.dart';

class AiShowcaseVisual extends StatefulWidget {
  const AiShowcaseVisual({super.key});

  @override
  State<AiShowcaseVisual> createState() => _AiShowcaseVisualState();
}

class _AiShowcaseVisualState extends State<AiShowcaseVisual>
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

    _staggeredAnimations = [
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.2, 0.8, curve: Curves.easeOut),
      ),
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.4, 1.0, curve: Curves.easeOut),
      ),
    ];

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
      height: 340,
      child: Stack(
        alignment: Alignment.center,
        children: [
          AiOrbitBackground(colors: colors),
          FadeTransition(
            opacity: _staggeredAnimations[0],
            child: AiFaceCard(colors: colors, label: l10n.aiFaceShapeLabel),
          ),
          Positioned(
            top: 12,
            left: 12,
            child: FadeTransition(
              opacity: _staggeredAnimations[1],
              child: RecommendationCard(
                icon: Icons.verified,
                iconColor: colors.primary,
                label: l10n.aiMatchLabel,
                labelColor: colors.primary,
                style: l10n.aiStyleFade,
                trackColor: colors.surfaceVariant,
                fillColor: colors.primary,
                fillFactor: 0.98,
              ),
            ),
          ),
          Positioned(
            bottom: 24,
            right: 12,
            child: FadeTransition(
              opacity: _staggeredAnimations[2],
              child: RecommendationCard(
                icon: Icons.recommend,
                iconColor: colors.secondary,
                label: l10n.aiRecommendedLabel,
                labelColor: colors.secondary,
                style: l10n.aiStyleCrop,
                trackColor: colors.surfaceVariant,
                fillColor: colors.secondary,
                fillFactor: 0.85,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
