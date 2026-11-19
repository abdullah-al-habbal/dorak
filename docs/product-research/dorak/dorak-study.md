# Dorak: an independent product, market and engineering study

Snapshot date: 2026-11-18. Written in English. Companion file: [dorak-feature-matrix.csv](dorak-feature-matrix.csv). Method: [study prompt](study-prompt.md).

## 0. Scope, method and limits

- **Reviewed commit:** `HEAD` `56879099bc3f6995a440bef4249afe5134c1d445` on branch `master`.
- **Working tree at start (17 entries):**
  - Modified: `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/graph/index-part-3.md`, `docs/index.md`, and ten dashboard test files under `frontend/web/dashboard/tests/`.
  - Untracked: `docs/competitor-analysis/` and `docs/product-research/`.
  - Everything cited from `backend/` and `frontend/` source is committed code; none of the modified files is product source. The modified documents were not used as evidence of product behavior.
  - This study creates two further untracked files and nothing else. Nothing was staged or committed.
- **Independence:** `docs/competitor-analysis/` was not opened and no comparison with any named competitor study is made. Prior handover notes, ADRs and plans are treated as leads and are labelled "doc" where used.
- **What was done:** read-only code and document review (key files read directly; the rest surveyed by search and by three read-only exploration passes), plus public web searches (standard mode).
- **What was not done:**
  - No test, build or server was run. Test counts are file counts only.
  - No live site, store listing or account was visited.
  - No runtime observation, so no feature is `observed`.
  - Secrets and `.env` files were not opened.
- **Finding labels:** **proven defect**, **unverified risk**, **legitimate trade-off**. Matrix statuses follow the prompt (`implemented` means a connected path in source and nothing about deployment).

## 1. Executive summary

**What Dorak is (per code).** A salon and barber marketplace plus operations platform. A modular Laravel API serves a Next.js dashboard for platform admin, brand owner, branch manager and barber roles, and three native Flutter apps for clients, branch teams and stylists. The project docs target Syria ([README.md:11-14](../../../README.md); `backend/docs/01-vision-and-scope.md:14`). Arabic and English with RTL are supported in the dashboard and apps.

**Visible product model (doc plus code).** A free client marketplace attracts end clients; brands and branches get operations tooling, with freemium feature gating (multi-branch, job board) and a platform commission ledger. Real money collection is not implemented: bookings are pay-at-salon only.

**Three strongest facts**

1. The booking core is carefully built: one transaction, row locks on the client, chair, services and barber, availability checked against branch hours, barber schedule and overlaps, and at-home rules (`backend/modules/Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php:44-80`).
2. Breadth for a pre-launch product: discovery with geo filters, reviews with disputes, three service modes, chair floor plan, job board, barber affiliation, commission and payout ledgers, and bilingual RTL UIs across web and three apps.
3. Disciplined structure and test posture: strict module layering and a large test tree (243 backend feature test files, 201 dashboard Vitest files, about 35 Playwright specs; counted, not run).

**Three biggest evidence gaps**

1. **Production existence.** No live site, store listing, production environment or user data was found. The deploy workflow is manual and says "no hosting yet" (`.github/workflows/deploy.yml`). Everything is "implemented in code" at best.
2. **Business facts.** No verified entity, pricing, customer count, revenue or launch country beyond Syria as a documented intent.
3. **Demand and willingness to pay.** No customer, salon or pilot data. The market sizing is formula-only.

**What decision the study allows.** It supports deciding what to build and validate next, and what a fair feature comparison must treat as `not_found` versus out of scope. It does not support any claim about traction, launch readiness, valuation or relative competitiveness.

**Differentiation hypothesis versus proven feature.** Hypothesis: a visual chair-level booking experience for barbershops and an integrated job and affiliation layer differentiate Dorak in Syria. What exists in code is the chair floor-plan read model and the booking flow on top of it; whether clients or owners value it is unproven.

## 2. Company and evidence

| Item | Finding | Source |
|---|---|---|
| Brand | "Dorak (دورك)" with logo and cover assets; brand voice documents exist | `backend/docs/marketing/` (doc) |
| Entity, publisher, team, funding | Not documented. Not inferred from Git. | not verified |
| Domains | Only a dev backend host appears in the deploy workflow; `dorak.sy` appears as seed emails and a planned link page; other domains are examples in docs | `.github/workflows/deploy.yml`; `backend/docs/marketing/02-platform-setup.md:58` (doc) |
| Social handles | Candidate handles only (`@dorak.sy`, `@dorak.app`, `@getdorak`) | `backend/docs/marketing/02-platform-setup.md` (doc) |
| Product docs | Vision, PRD, ADRs, readiness notes and a backlog exist; some are stale (for example an agent guide still calls face analysis a stub, and CI is described as formatting-only while the workflow runs tests) | `backend/docs/`, `docs/backlog/index.md` (doc) |
| Version state | All three apps at `1.0.0+1` with placeholder pubspec descriptions | `frontend/mobile/apps/*/pubspec.yaml` |

**Public web check.** A search for "Dorak" salon booking in Syria returned no app or site tied to this project. Results were unrelated: a tourism super app, hotel-booking apps and a generically named salon-booking listing whose country and publisher are unstated ([App Store listing "Booking salon"](https://apps.apple.com/us/app/id1509130388) and an unrelated app named "Dor" were returned; neither was matched to the project). Per the study rules none is attributed to Dorak. Verification plan: obtain the publisher name and bundle ids from the owner and compare them with `com.dorak.client_app` and `com.dorak.clientApp`.

## 3. Platforms and availability

| Platform | Audience | Built | Published | Country and language | Notes |
|---|---|---|---|---|---|
| Customer web | clients | **No** (not found) | n/a | n/a | Dashboard root redirects to `/dashboard` (`frontend/web/dashboard/src/app/page.tsx`) |
| Partner web (dashboard) | admin, owner, manager, barber | Yes, Next.js 16, role by URL guard | Not verified | Arabic and English, RTL | `nav.constant.ts:36-88` |
| Brand sign-up page | prospective brands | Yes (`/register/business`) | Not verified | same | public page inside the dashboard |
| Marketing website | prospects | Yes, Blade in backend (`website_routes.php`) | Not verified | Arabic and English | CMS-driven; sitemap and robots; no analytics code |
| Customer Android | clients | Yes (`client_app`) | No evidence | Arabic and English | Debug-key fallback for release builds (`android/app/build.gradle.kts:35-51`) |
| Partner Android | owners/branch, barbers | Yes (`business_app`, `stylist_app`) | No evidence | same | Two separate apps |
| iOS and iPad | all | iOS projects exist | No evidence | same | Readiness doc lists placeholder client id and missing Firebase files; no iPad-specific work |
| Branded web per salon | salon clients | **No** | n/a | n/a | |
| PWA or desktop | | **No** | | | Flutter scaffolds for web and linux exist but are template manifests, not products |
| Operations panel | platform staff | Part of the dashboard admin guard | Not verified | | Filament was retired per the project docs |
| WhatsApp, Instagram | | Not found in code | | | |

Native Flutter, not WebView: the three apps are separate Flutter projects with their own feature code (234, 73 and 91 Dart files respectively, per directory counts). Store availability, ratings and update dates: **not verified** (no listing identified).

## 4. Product and user experience

**Actors and what each can do (code):**

- **Client** (`client_app`): discovery feed with filters and saved filters, branch details with floor-plan grid, booking (chair, barber at branch, or at-home), booking tracker, cancel, rebook from history, reviews, notification inbox, account deletion, phone OTP, Google sign-in, face analysis and style matching. Payment is a "pay at salon" notice only.
- **Branch team / owner** (`business_app` and dashboard): bookings, chairs, stylists, jobs, services, working hours, earnings, reviews, payouts, subscription view. A floor-plan zone editor is listed as not built in the mobile inventory (doc).
- **Barber** (`stylist_app` and dashboard): schedule, appointments, earnings, portfolio, affiliations, jobs.
- **Admin** (dashboard): brand approval, barber approval, catalog, currencies, plans, subscriptions, commissions, payouts, reviews, support, content, analytics, settings.

**Core journey: client books a chair (traced).**

1. `GET /explore/*` and `GET /branches/{branch}/slots` list results and slots (`explore.php:12-17`, `slots.php:9-10`).
2. `POST /client/bookings` runs the create handler inside `DB::transaction` (`CreateBookingHandler.php:22`). The resolver locks the client, chair, active services and barber, then checks branch hours, barber schedule and overlaps, and creates a `pending` booking with `pay_at_salon` (`CreateBookingEloquentResolver.php:44-80, 199-225`).
3. A status notification job is dispatched (`CreateBookingHandler.php:25`); push works only with FCM credentials (`FcmNotificationSender.php:50-52`).
4. The barber or branch accepts, starts and completes; completion records platform commission once per booking (`CommissionRecorder.php:55`).
5. A review request goes out after completion (doc and notifier path: `BookingTransitionNotifier.php:22`).

**Alternative and failure cases found:** banned client or barber, chair under maintenance, outside hours or schedule, overlap, non-discoverable branch, barber not affiliated, at-home radius violation, 2-hour cancel cutoff. Client-supplied payment fields are rejected. Not found: auto-confirm, client self-reschedule, reminders, deposits, no-show penalties.

**Accessibility, usability, localization.** Arabic and English parity is structural: 615 ARB keys in each language and the dashboard uses logical CSS properties by rule. Accessibility conformance was not assessed. Locale persistence in the mobile apps is listed as not built (doc). No trial of the apps was performed.

## 5. Market, customers and geography

**Geography.** The project docs name Syria only (Damascus pilot of 5-10 salons planned in marketing docs, doc). Saudi Arabia appears nowhere in the project docs; per the study prompt it is treated here as a *candidate comparison market*, not a launch market. No launch country is verified.

**Segments (from product shape):** (a) men's barbershops and women's salons as multi-chair venues; (b) freelance and at-home barbers (booking works for freelancers; freelancer-only onboarding is deferred per ADR 0002 (doc)); (c) end clients choosing venues by distance and style. Buyer: venue owner; user: owner, staff and client. Problem they would pay to solve: unverified (no-shows, walk-in queueing, discoverability, or staff hiring are hypotheses).

**Switching barriers (hypotheses).** Existing habits (phone, messaging and a paper notebook), staff training, and venue willingness to carry a second booking channel.

**Public market facts gathered (dated, with scope):**

- Syria internet use: about 9.0 million users, 35.8% penetration at the start of 2025 per [DataReportal Digital 2025: Syria](https://datareportal.com/reports/digital-2025-syria). The same percentage reappears in other years, so the trend is unreliable. A smartphone-specific figure was not retrieved.
- Apple's App Store access was reported restored in Syria in September 2025 ([The New Arab](https://www.newarab.com/news/apple-products-app-store-return-syria-amid-sanctions-lift)). Google Play status: not found in results.
- Visa and Mastercard were reported to resume in Syria in May 2026, with sources giving slightly different dates ([PaymentsJournal](https://paymentsjournal.com/syria-rejoins-visa-and-mastercards-global-networks-after-15-years), [Payment Expert](https://paymentexpert.com/2026/01/06/syria-mastercard-qnb-group-growth/)). Merchant acquiring and local-currency settlement for a small app: not established. Secondary sources of mixed quality; verify with the central bank before relying on them.
- Saudi Arabia, as a candidate comparison market: ZATCA e-invoicing runs in two phases (generation from 4 Dec 2021; integration from 1 Jan 2023) with staggered waves ([ZATCA roll-out phases](https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/Roll-out-phases.aspx?lang=en)). The Personal Data Protection Law was not covered by the results and is **not verified** here.

**TAM/SAM/SOM (formula only; no number is asserted).**

- Definitions to keep separate: sector service revenue; booked GMV; software revenue pool; Dorak revenue.
- Software pool: `TAM_software = N_venues × ARPA_year` where `N_venues` is the count of salons and barbershops in the market and `ARPA_year` is the annual software spend per venue.
- `SAM = N_venues × share_with_smartphone_and_booking_need × share_reachable_by_channel × ARPA_year`.
- `SOM = SAM × achievable_share_in_24_months`.
- Missing denominators: venue counts per city (municipal or chamber of commerce registries, or a field census), ARPA (pilot pricing test), and the share of venues that accept appointments at all.
- Evidence plan: count venues in two pilot neighbourhoods by walking surveys, then interview 20 owners on current booking methods and what they spend today.

## 6. Competitors and positioning

Limited by search. Evidence only from vendor-authored or aggregator pages; none was independently verified, and no scored comparison is made.

| Alternative | Type | Basis | Confidence |
|---|---|---|---|
| WhatsApp, phone calls and a paper notebook | non-software | typical local practice (hypothesis; no source retrieved) | low |
| Instagram direct messages | social channel | hypothesis | low |
| Fresha | global marketplace plus salon OS | described by third-party roundups as booking, POS and marketplace ([example roundup](https://www.lilachbullock.com/fresha-alternatives/)) | medium-low |
| Booksy | global barber and salon booking | described as targeting barbers and stylists, with an AI receptionist ([example roundup](https://www.lilachbullock.com/booksy-alternatives/)) | medium-low |
| Regional booking apps | local | App Store listings such as [Booking salon](https://apps.apple.com/us/app/id1509130388) exist; publisher and country not verified | low |

**Positioning axes for later comparison:** marketplace versus operations depth; chair/floor-plan visualization; at-home service; payments; local-language and local-rail fit; hiring layer. Dorak's current profile on each is in the matrix.

**SWOT (evidence-tagged).**

| | Evidence | Hypothesis |
|---|---|---|
| Strengths | Safe booking core; broad role coverage; bilingual RTL; strict architecture; sizeable tests (counted) | Chair visualization and affiliation/job layer fit barbershop culture |
| Weaknesses | No payments, reminders, offers, deposits or customer web; nothing published; no analytics; no backups or monitoring config in the repo | Pay-at-salon only may limit no-show control |
| Opportunities | Reopening of Apple services and card rails in Syria (external, secondary sources) | First-mover in underserved city markets |
| Threats | Payment, currency and sanctions uncertainty; informal competitors (messaging and notebooks) | Cold-start of a two-sided marketplace |

## 7. Digital presence, marketing and ASO

| Channel | Classification |
|---|---|
| Marketing website | Code exists; live presence **not verified** |
| Blog, city and service pages | Not found (CMS pages and testimonials only) |
| App Store, Google Play | **Not verified**; no listing tied to the project |
| Instagram, Facebook, TikTok, LinkedIn, YouTube, X, Snapchat, Telegram | Candidate handles in plans only; **not verified** |
| WhatsApp, Google Business Profile | Not found |
| Analytics, pixels, attribution | Not found in website, dashboard or mobile source |

The website has canonical URLs, Open Graph tags, a sitemap with language alternates and robots (code). Funnel (hypothesis): prospect → brand registration page → admin approval → onboarding → first booking, and for clients: store → install → search → book. No funnel is measurable today because no analytics code exists. ASO cannot be assessed without a listing.

## 8. Revenue model, pricing and feasibility

**Documented:** freemium with feature gates (multi-branch, job board); platform commission per completed booking recorded as an accrual; manual billing at launch (backlog); payment processing outside the MVP (`backend/docs/02-prd.md:44`, doc).

**In code:** subscription plans assigned to brands by an admin with a grace period; commission rules (percent in basis points or flat) by global, brand or branch scope; draft payouts with approve and mark-paid. No money is collected, no invoices, no card billing. **No price points exist anywhere in the repository** (website pricing renders CMS content). Pricing is therefore **not verified**.

**Feasibility model (formulas; no forecast).** Currency USD, monthly unless stated.

- `MRR = paying_venues × ARPA_month + commission_accruals`
- `contribution_margin = ARPA_month − direct_cost_per_venue` (hosting, SMS, push, support)
- `payback_months = CAC / contribution_margin`
- `break_even_venues = fixed_monthly_cost / contribution_margin`
- `LTV = contribution_margin / monthly_churn`

*Scenario definitions (hypothetical, not findings):* **A** subscription-only; **B** commission-only on completed bookings; **C** hybrid. Inputs required before any number is meaningful: willingness to pay in USD and in local currency, commission acceptance, CAC from the pilot, churn from cohort data, and direct costs from a real deployment. Arithmetic illustration only: if `ARPA_month = X` and `fixed_monthly_cost = F`, break-even is `F / (X − direct_cost)` venues; no values are asserted. Order value, tax and provider dues stay outside Dorak revenue, and the commission ledger records only the platform's share.

**Purchase feasibility for a typical venue:** cannot be assessed without pricing and the venue's income. Note the pay-at-salon model means Dorak never sees the transaction, so commission collection depends on voluntary reporting or later payment integration (risk, section 9).

## 9. Technology, security and operations

Format: context → problem → risk → solution → example. Classification in brackets.

**9.1 Double-booking prevention** [legitimate trade-off, with an unverified risk]

- *Context/requirement:* no two active bookings may overlap for the same barber or chair.
- *Evidence:* one transaction, `lockForUpdate` on client, chair, services and barber, and a locking overlap check (`CreateBookingEloquentResolver.php:46, 100, 119, 182, 265`; handler `CreateBookingHandler.php:22`). The bookings table has only plain indexes (`modules/Booking/Database/Migrations/0001_01_01_200060_create_bookings_table.php:28-30`), so no database constraint backs this up. No idempotency key exists.
- *Counterexample search:* a chair-only booking and a barber-only booking for the same barber both lock the barber row, so they serialize. Two bookings on one chair serialize on the chair row. Walk-in and reschedule paths also lock (`RescheduleBookingEloquentResolver.php:31-42`; walk-in handler wraps a transaction at `CreateWalkInBookingHandler.php:25`). I did not find a path that skips the locks. Whether every write path (for example, admin-side or import paths) takes them was not exhaustively verified.
- *Risk:* correctness rests on every future write path remembering to lock; a missed path would double-book silently. Client retries after a timeout can create a duplicate booking.
- *Alternative:* an idempotency key on create, plus a time-range exclusion or slot-row uniqueness as a backstop where the database supports it. *Proposed, not tested.*

**9.2 Tenant isolation** [unverified risk]

- *Requirement:* a brand or branch must never read or write another's data.
- *Evidence:* application-level scoping by actor (`scopedBranchIds`, `scopedBrandIds`, policies in `modules/Dashboard/Policies/`, a write guard), token ability `dashboard` enforced for dashboard paths (`modules/Core/Http/Middleware/EnforceTokenScope.php:45-46`). There are no global query scopes or database-level tenancy. Test files for cross-tenant authorization exist (read by name; not run).
- *Risk:* each new query must remember to scope. Not demonstrated as defective.
- *Solution:* keep an authorization matrix test per new endpoint (the project's test-engineering skill already prescribes this).

**9.3 Money and settlement integrity** [legitimate trade-off]

- Commission recording is idempotent: `firstOrCreate` on `booking_id` backed by a unique column (`CommissionRecorder.php:55`; migration `2026_10_29_000040_create_commission_tables.php:30`). Amounts are integer minor units. A booking is priced in its first service's currency; mixed-currency carts are not summed across currencies (`CommissionRecorder.php:48-49`), which silently excludes other-currency lines. [unverified risk: depends on whether mixed-currency bookings are possible]
- Because payment is offline, the commission is an accrual on completions the barber or branch marks. Manipulation by not marking completion is a business-model risk, not a code defect.

**9.4 Notifications** [proven defect for the reminder requirement, trade-off for FCM]

- Push silently no-ops without FCM credentials (`FcmNotificationSender.php:50-52`). No scheduled reminder job is registered among the entries found (owner purge, subscription expiry, vector recompute, delivery prune, review-dispute release, face-photo purge). If booking reminders are a product requirement, this is a gap; the PRD requirement itself was not located.

**9.5 Search** [legitimate trade-off] SQL `LIKE` over translatable JSON columns (`modules/Explore/Support/ExploreTextSearch.php`) is adequate for small catalogs and weak for Arabic normalization and ranking at scale. Not load-tested.

**9.6 Dashboard architecture** [legitimate trade-off] The browser talks only to Next route handlers that proxy to Laravel with HttpOnly cookies, a default-deny allow-list and Zod parsing (`proxy-allow-list.constant.ts`). This hides tokens from scripts and adds a hop; the allow-list must be maintained per endpoint.

**9.7 Rate limiting** [unverified risk] Auth routes are throttled (`client.php:49` and others); no throttle was found on public discovery or booking creation, nor a global API limiter. Abuse impact untested.

**9.8 Operations** [unverified risk] No backup tooling, error tracking or uptime monitoring is configured in the repository; a health endpoint exists (`HealthCheckAction.php:21`). The deploy workflow comments say rollback goes through restore. Production does not exist per docs. A written control is not an applied one.

**9.9 Scalability.** Database queue by default with a Redis option, Reverb for realtime. No load test. Weak connectivity handling in the apps was not assessed.

**Test posture.** Counted, not run: backend 243 Feature, 24 Unit, 6 Integration, 1 Concurrency; dashboard 201 Vitest files and about 35 Playwright specs; mobile 50, 17 and 19 test files for the three apps. A test is not deployment evidence.

## 10. Privacy, compliance and risk

**Data processed:** client identity and contact, phone and email, location, bookings, face photos (analysis), device tokens, reviews, search and interaction logs.

**Controls found (code):** account deletion with anonymisation, blocked while bookings are active (`ClientAccountDeletion.php:36-52`); face photos purged after a configurable 30 days by default; notification delivery pruning; private routes for face photos; status-change audit log. Legal links and a delete-account page exist in the website and apps (docs and commit log).

**Not found:** consent records, marketing opt-out, data export, a documented list of processors (FCM, an AI provider, SMS gateway), cross-border transfer notes. "Not found" is not a legal judgment and not proof of absence in production.

**Country requirements:** Syria: no verified framework was researched. Saudi Arabia (candidate): PDPL and e-invoicing apply if launched; only e-invoicing phases were retrieved ([ZATCA](https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/Roll-out-phases.aspx?lang=en)).

| Risk | Impact | Likelihood | Evidence | Proposed owner |
|---|---|---|---|---|
| Face photos sent to an external AI provider without documented consent | High | Medium | `AnalyzeFacePhotoJob.php`; no consent records found | Product owner and legal |
| Double booking through a future unlocked write path | High | Low-Medium | 9.1 | Backend lead |
| No backups or monitoring at launch | High | Medium | 9.8 | Operations |
| Commission leakage under pay-at-salon | Medium | High (hypothesis) | 9.3 | Product and finance |
| Payment rail and currency uncertainty in Syria | High | Medium | section 5 sources | Product owner |
| Push silently disabled in production | Medium | Medium | 9.4 | Mobile and backend |
| Mobile release signing and Firebase files missing | Medium | High | readiness doc; `build.gradle.kts:35-51` | Mobile lead |

## 11. Measurement and 90-day plan

**Days 0-14.** Confirm the launch country and pilot scope; fix publisher, entity and domains; record venue counts in two neighbourhoods; configure a staging environment and smoke the booking flow end to end.

**Days 15-45.** Pilot with 5-10 venues (the doc plan): onboard, run real bookings, collect baseline no-show and walk-in ratios. Wire real FCM, SMS gateway and error tracking. Add reminders if the pilot shows no-shows matter. Add idempotency on booking create.

**Days 46-90.** Test pricing (flat subscription versus commission), measure retention and activation, decide on online payments by market.

**Indicators and denominators.**

- *Activation:* venues with first completed booking within 14 days ÷ approved venues.
- *Weekly active venues:* venues with at least one completed booking in the week ÷ approved venues.
- *Booking completion rate:* completed ÷ created.
- *No-show rate:* no-show ÷ confirmed.
- *Client repeat rate:* clients with 2 or more completed bookings in 60 days ÷ clients with one or more.
- *Protection indicators:* double-booking incidents (target zero), failed pushes ÷ attempted, authorization failures per week, backup restore test passes.

**Testable differentiation proposals.**

| Segment | Hypothesis | Experiment | Success measure | Cost or risk |
|---|---|---|---|---|
| Multi-chair barbershops | Chair floor plan raises booking conversion | Show floor plan to half of new clients | Conversion, bookings per client | Low; uses existing A/B tooling |
| At-home barbers | Radius-checked at-home booking opens a new demand pool | Onboard 10 freelancers in one city | Weekly at-home bookings | Safety and trust issues |
| Owners hiring | Job board reduces staff search time | 5 owners post jobs | Applications per posting, fill time | Low demand risk |

## 12. Appendix: evidence and gaps

| Unresolved question | Effect on a later comparison | What is needed | Priority |
|---|---|---|---|
| Is anything deployed or published? | Determines whether features count as live | Owner statement, store console and hosting records | P0 |
| Launch country and currencies | Defines market scope and payment fit | Owner decision | P0 |
| Pricing and commission terms | Feasibility and positioning | Owner decision, pilot test | P0 |
| Venue counts and spend | TAM/SAM/SOM | Field census, registries | P1 |
| Do clients want chair selection? | Differentiation claim | Pilot data | P1 |
| Mixed-currency commission behavior | Ledger correctness | Test in isolated environment | P2 |
| Reminder requirement | Whether BOOK.REMINDERS is a gap | PRD or pilot feedback | P1 |
| Social login backend state (doc conflict) | Auth coverage | Run an isolated test | P2 |
| Competitor features and prices | Later comparison | Vendor sources per market | P1 |
| PDPL and Syrian data rules | Compliance | Legal review | P1 |

**Scope actually examined.** Backend `backend/modules` (routes, booking, commission, payout, payment, notification, privacy, scheduler, website), dashboard navigation, proxy, locales and test inventory, mobile app manifests, feature inventory and release config, CI and deploy workflows, project vision and marketing docs. Not examined line by line: most mobile Dart code, most dashboard components, migrations other than those cited, the dispute and affiliation flows, and the full test bodies.

**Useful aggregate data to request:** paying venues and branches; registered and approved venues; bookings created, completed, cancelled and no-show by channel; client acquisition source; retention by cohort; revenue and commission accrual versus collection; payment methods; support tickets per venue; country and device distribution.

**Sources used (web, accessed 2026-11-18):** [DataReportal Digital 2025: Syria](https://datareportal.com/reports/digital-2025-syria); [The New Arab on App Store return](https://www.newarab.com/news/apple-products-app-store-return-syria-amid-sanctions-lift); [PaymentsJournal on Visa and Mastercard](https://paymentsjournal.com/syria-rejoins-visa-and-mastercards-global-networks-after-15-years); [Payment Expert](https://paymentexpert.com/2026/01/06/syria-mastercard-qnb-group-growth/); [ZATCA roll-out phases](https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/Roll-out-phases.aspx?lang=en); aggregator pages for Fresha and Booksy as listed in section 6.
