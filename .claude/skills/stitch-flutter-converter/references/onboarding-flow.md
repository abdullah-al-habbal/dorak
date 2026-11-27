---
codeanchors:
  - frontend/mobile/
---

# Onboarding-specific conventions (apply only to onboarding screens)

- Flow is wired in `AppRouter`; Skip / "Don't show again" go to the post-onboarding route; the locale toggle threads through every screen. Navigation never lives in a screen body or a Bloc.
- **Progress dots are flow-wide:** `count` = total steps, `activeIndex` = 0-based current step. When a step is added, audit every onboarding screen (a hard-coded `count` shipped wrong twice).
- **CTA labels by position:** first and last steps use `onboardingGetStarted`; middle steps use `next`. Back (`previous`) on every step after the first; Back and swipe-left use `context.pop()`.
- Illustrative onboarding content (card labels, demo copy) is localized in ARB; this is the one place demo content ships.
- Screens without a hero image must not declare `onboardingConfig` (unused fields fail analyze).
- Motion: 800 ms controller, staggered `Interval(..., curve: Curves.easeOut)` fade/slide; splash logo uses `Cubic(0.16, 1.0, 0.3, 1.0)`. For multi-item stagger use `Interval(i*0.1, 0.5 + i*0.1)` with `FadeTransition` + `SlideTransition(Offset(0, 0.05) -> zero)`.
