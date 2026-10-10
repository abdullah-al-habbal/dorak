import 'package:flutter/material.dart';
import 'package:design_system/design_system.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/onboarding/widgets/glass_card.widget.dart';

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
              _BookingVisualStagger(
                animation: _staggeredAnimations[0],
                child: _BookingServiceCard(colors: colors, l10n: l10n),
              ),
              const SizedBox(height: 12),
              _BookingVisualStagger(
                animation: _staggeredAnimations[1],
                child: Transform.translate(
                  offset: const Offset(24, 0),
                  child: _BookingProfessionalCard(colors: colors, l10n: l10n),
                ),
              ),
              const SizedBox(height: 12),
              _BookingVisualStagger(
                animation: _staggeredAnimations[2],
                child: _BookingDateCard(colors: colors, l10n: l10n),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _BookingVisualStagger extends StatelessWidget {
  const _BookingVisualStagger({required this.animation, required this.child});
  final Animation<double> animation;
  final Widget child;
  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: animation,
    child: SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0, .05),
        end: Offset.zero,
      ).animate(animation),
      child: child,
    ),
  );
}

class _BookingServiceCard extends StatelessWidget {
  const _BookingServiceCard({required this.colors, required this.l10n});
  final DorakColors colors;
  final AppLocalizations l10n;
  @override
  Widget build(BuildContext context) => Transform.rotate(
    angle: -.035,
    child: GlassCard(
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: colors.surfaceContainerHigh,
              borderRadius: DorakDimensions.radiusDefault,
            ),
            child: Icon(Icons.content_cut, color: colors.primary, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.bookingServiceLabel,
                  style: DorakTypography.labelLg.copyWith(
                    color: colors.onSurface,
                  ),
                ),
                Text(
                  l10n.bookingServiceMeta,
                  style: DorakTypography.bodyMd.copyWith(
                    color: colors.secondary,
                  ),
                ),
              ],
            ),
          ),
          Icon(Icons.check_circle, color: colors.primary, size: 22),
        ],
      ),
    ),
  );
}

class _BookingProfessionalCard extends StatelessWidget {
  const _BookingProfessionalCard({required this.colors, required this.l10n});
  final DorakColors colors;
  final AppLocalizations l10n;
  @override
  Widget build(BuildContext context) => GlassCard(
    child: Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: colors.surface,
            border: Border.all(color: colors.primaryFixed, width: 2),
          ),
          child: Icon(Icons.person, color: colors.primary, size: 22),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.bookingProfessionalLabel,
              style: DorakTypography.labelLg.copyWith(color: colors.onSurface),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.star, size: 14, color: colors.primary),
                const SizedBox(width: 4),
                Text(
                  l10n.bookingProfessionalRating,
                  style: DorakTypography.labelMd.copyWith(
                    color: colors.primary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  );
}

class _BookingDateCard extends StatelessWidget {
  const _BookingDateCard({required this.colors, required this.l10n});
  final DorakColors colors;
  final AppLocalizations l10n;
  @override
  Widget build(BuildContext context) => Transform.rotate(
    angle: .035,
    child: GlassCard(
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: colors.primaryContainer,
            ),
            child: Icon(
              Icons.calendar_today,
              color: colors.onPrimaryContainer,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.bookingDateLabel,
                  style: DorakTypography.labelLg.copyWith(
                    color: colors.onSurface,
                  ),
                ),
                Text(
                  l10n.bookingTimeLabel,
                  style: DorakTypography.bodyMd.copyWith(
                    color: colors.secondary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: colors.primary,
            ),
            child: Icon(Icons.check, color: colors.onPrimary, size: 18),
          ),
        ],
      ),
    ),
  );
}
