# Dorak dashboard design system

## Direction
Calm, dense workbench for people on a shop floor. Cool ink-slate in the dark, lather-white paper in the light, one pole-blue accent.
Domain: chair, razor, lather, pole stripe, appointment book, brass fittings.

## Signature
The barber-pole stripe (`pole-stripe` utility). Only three places: the active nav indicator, the sign-in panel (turns once on load) and the route progress bar. Never decoration elsewhere.

## Tokens
Defined in `src/app/globals.css`. Domain names (`--ink`, `--lather`, `--pole-blue`, `--pole-red`, `--brass`) feed the shadcn names. Light under `:root`, dark under `.dark`; one hue (262), only lightness shifts between surfaces.

## Depth
Light: layered transparent shadows (`shadow-lift` for cards, `shadow-float` for overlays). Dark: hairline `rgba(255,255,255,.08)` borders. Sidebar shares the canvas colour. Inputs are inset and darker than their surface.

## Type
Bricolage Grotesque (display), Instrument Sans (body), IBM Plex Sans Arabic for AR. Tabular numbers on data (`.tabular`). Headings balance, body text wraps with `pretty`.

## Spacing and shape
4px base. Radius scale 6 / 10 / 14 / 18. Cards pad 20px (16px small). Controls: 36px default, 40px inputs, 44px large.

## Motion
Under 300ms, custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`, transform and opacity only. Press scale 0.97. Theme switch cross-fades colours for 260ms. `prefers-reduced-motion` removes movement.

## Components
- Button: 36px h, 14px/500, primary has an inset highlight and a soft ring on hover.
- Sidebar: 264px expanded, 68px collapsed, pole-stripe indicator on the active item. Pages not built yet show a "Soon" tag.
- Header: 64px, blurred background, breadcrumbs left, language / theme / notifications / account right.
- Forms: label above, inline error under the field, form-level error in a `role="alert"` banner.
