---
nodeid: skills.repo.stitch-flutter-converter.templates.onboarding-scaffold
parentnode: skills.repo.stitch-flutter-converter
childnodes: []
codeanchors:
  - frontend/mobile/
---

# Onboarding screen scaffold (static, no backend data)

```dart
// <feature>.screen.dart — StatefulWidget + SingleTickerProviderStateMixin
class FeatureScreen extends StatefulWidget {
  // Callbacks only: onNext, onSkipForNow, onDontShowAgain, onLocaleToggle.
  // Back = context.pop(). Take onboardingConfig only if the screen shows the hero.
}

class _FeatureScreenState extends State<FeatureScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _fade;           // 800 ms
  late final List<Animation<double>> _stagger;    // Interval(0.0|0.1|0.2 -> 0.6|0.7|0.8, easeOut)
  // initState: create controller + CurvedAnimations, _fade.forward();
  // dispose: _fade.dispose();

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      backgroundColor: colors.background,
      body: SwipeNavigation(
        onSwipeRight: widget.onNext,
        onSwipeLeft: () => context.pop(),
        child: SafeArea(
          child: Column(children: [
            FadeTransition(opacity: _stagger[0], child: OnboardingHeader(/* string params */)),
            const Spacer(),
            FadeTransition(opacity: _stagger[2], child: /* FeatureContent */),
          ]),
        ),
      ),
    );
  }
}
```

Content widget: `Column(mainAxisSize: min, crossAxisAlignment: center)`: headline (`headlineLgMobile`, centered), subtitle (`bodyLg`), visual widget, `ProgressDots`, then a `Row` of `[Expanded SecondaryButton(Back)] [12] [Expanded PrimaryButton(CTA)]`.
