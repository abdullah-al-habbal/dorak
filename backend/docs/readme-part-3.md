---
nodeid: backend.docs.part-3
parentnode: backend.docs
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 3 · [Dorak Backend — Product Documentation](README.md) · [Previous](readme-part-2.md)

## Marketing documentation

The `marketing/` subfolder contains brand strategy, platform setup, content strategy, and launch plans. These documents mirror the same rigor as the backend docs — they are the single source of truth for Dorak's market-facing identity.

| # | File | Purpose |
|---|------|---------|
| 01 | [`01-brand-dna.md`](./marketing/01-brand-dna.md) | Brand DNA — Elevator Pitch, Founder Story, Audience, Tone, Competitive Edge (Bilingual EN/AR) |
| 02 | [`02-platform-setup.md`](./marketing/02-platform-setup.md) | Platform Setup — Naming, Bios, Visual Identity, Link Routing, SEO Keywords (Bilingual EN/AR) |
| 03 | [`03-content-strategy.md`](./marketing/03-content-strategy.md) | Content Strategy — Pillars, B2B/B2C Tactics, Cadence & Distribution (Bilingual EN/AR) |
| 04 | [`04-launch-campaign.md`](./marketing/04-launch-campaign.md) | Launch Campaign — Teaser, Soft Launch, Hard Launch, Retention & Referral (Bilingual EN/AR) |
| 05 | [`05-metadata-and-seo.md`](./marketing/05-metadata-and-seo.md) | Metadata & SEO — Global Keywords, Platform Meta Descriptions (Bilingual EN/AR) |
| 06 | [`06-teaser-content-plan.md`](./marketing/06-teaser-content-plan.md) | Teaser Content Plan — Pre-Launch Themes & Content Calendar (Bilingual EN/AR) |
| 07 | [`07-conversion-assets.md`](./marketing/07-conversion-assets.md) | Conversion Assets — Landing Page Copy, CTAs, Lead Capture (Bilingual EN/AR) |
| 08 | [`08-visual-assets-inventory.md`](./marketing/08-visual-assets-inventory.md) | Visual Assets — Logo, Color Palette, Typography, Generation Prompt (Bilingual EN/AR) |

---

## Status legend (used inside the docs)

- ✅ **Decided** — agreed; build to this.
- 🟡 **Open** — a decision still owed by the product owner (see the "Open Decisions" section of the PRD).
- 🔭 **Later** — intentionally deferred (offline mode, map localization, advanced analytics, etc.).

---

## A note on scope discipline

Several capabilities raised during brainstorming are **intentionally postponed** so the MVP stays shippable: **offline‑first mode, map provider localization, SMS/WhatsApp gateway engineering, advanced analytics, complex staff shifts, and the paid‑vs‑unpaid job distinction.** They are recorded as 🔭 **Later** and revisited *after* the core engine is live. See [`01-vision-and-scope.md`](./01-vision-and-scope.md).
