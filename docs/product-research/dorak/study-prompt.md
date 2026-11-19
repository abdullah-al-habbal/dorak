---
nodeid: docs.product-research.dorak.study-prompt
parentnode: docs.product-research.dorak
childnodes: []
codeanchors:
  - docs/product-research/
---

# Claude Code prompt: an independent Dorak study

Routes: [Dorak hub](index.md) · [product research](../index.md) · [documentation graph](../../index.md)

> This prompt is a harness prepared for a future, explicit run. It has not been run, and its two output files do not exist yet.

Copy the content of this prompt into Claude Code after running it from the project folder. The goal is to study "Dorak" on its own first; a comparison with another product, if any, will come in a separate phase. Write all outputs in English.

## The task

You are a product and market researcher and a business analyst, and an engineer who reviews evidence when needed. Carry out a comprehensive study of the product **Dorak**, on the model of a comprehensive digital-product study that covers the company, market, customers, the product on every platform, competitors, marketing, feasibility, technology and compliance. Do not turn it into an inventory of routes or a code review only, and do not try to issue a verdict that Dorak is better or worse than any competitor in this phase. Understand what Dorak actually offers before classifying it; do not assume it is dedicated to salons, or that every common channel or feature is required of it.

The repository is `/home/lenovo/work/projects/dorak`. Read the relevant `CLAUDE.md` and `AGENTS.md` instructions, and respect `.aiignore` and the repository rules. The starting point is `README.md`, `docs/`, `backend/` and `frontend/`, and whatever general build, deployment and CI settings are needed. Work on the current version: record the history, the branch, `HEAD`, and whether the tree has local changes; distinguish the commit's state from what you only observed in the current working changes. Do not take the existence of a folder, a file name or a technical dependency as evidence of a published product or platform.

### Independent review rule

- Record `HEAD`, the branch and the working-tree status at the start. When it matters, distinguish committed behavior from local uncommitted changes, and say which one each finding rests on.
- Never use prior session summaries, handover notes or ADRs as proof that something is correct. They are leads to verify against the code, tests and runtime evidence.
- For each material architecture judgment, state the requirement or invariant it must satisfy, cite the evidence (`path:line` or a direct link), look actively for a counterexample, and explain the impact and an alternative if one is warranted.
- Separate three classes and label each finding with one: **proven defect** (demonstrated by evidence), **unverified risk** (plausible, not demonstrated), and **legitimate trade-off** (a defensible choice with known costs).
- The study must still cover product, market and business as the sections below require, not only code and architecture.

### Working rules

- Read safely. Do not modify the project's code or documents, do not checkout, reset or commit, do not install dependencies, and do not run migrations, seeders or commands that connect to live data. Do not sign in to real accounts, send messages or create bookings or payments; if you need a write experiment in an isolated environment, propose it in the report instead of executing it without permission.
- Do not open secret files, quote keys, personal data or real logs, or move code to search sites or services. If you need to understand a setting, use non-secret example files or the setting names only. In the outputs write descriptions, `path:line` references and aggregate non-sensitive numbers instead of copying data or private pieces of code.
- Start with local verification, then use public web sources **if search tools are available and allowed**. Do not attribute any site or app named "Dorak" to this project unless cross-evidence ties it, such as an official publishing link from the project, a matching publisher and app identifier, or a domain approved by the product owner. When matching or searching is impossible, state what was not possible and the verification plan, and complete the local study instead of waiting.
- Any live check is read-only on public pages confirmed to be tied to the project, with no accounts and no changes. Reading tests helps assess what the code covers; do not say a test passed unless you actually ran it in an isolated, authorized environment.
- Do not fill gaps with numbers of your own. If pricing, user count, revenue or launch country is missing, put "not verified". You may offer useful hypothetical scenarios, provided they are separated from actual findings and explicitly named. Do not stop waiting for this data; gather follow-up questions at the end of the report and tie them to clear decisions.

## Execution and verification method

1. **Build an evidence map:** read the project's instructions and documents to understand the idea, the categories and the constraints, then identify the web and mobile entry points if any, the domains in the backend, role permissions, deployment paths, contracts and tests. Mark what comes from an old document or a future plan.
2. **Trace the critical journeys end to end:** where applicable, connect the interface and the route or API to its permissions, the domain logic, the storage mechanism, and the test or integration side. Check feature flags, mocks and demo data. Example: the existence of a model or endpoint to create an appointment is not enough; look for the availability check, the confirmation state, the notification timing and what happens on failure. Use greater depth for the journeys on which the product's value rests, and state any parts built on a sample.
3. **Examine the public channels independently:** verify the customer site, the partner dashboard, direct links, the official stores, the last update date and the ratings where they appear. Distinguish Android, iOS, iPad, responsive web, PWA, desktop app, and an API or internal operations panel. Specify the country, the store and the observation date; installation, commercial availability, and the published version matching the current commit are different things.
4. **Research the market, not only the repository:** extract usage segments from the product, and verify the audience and geography where possible. Use official sources for the market and regulation and competitors' own sources for their features and prices. State the source's date and scope, and give no market figure without a unified definition and its applicability to Dorak. If geography is not established, study Saudi Arabia and Syria as **two candidate markets for comparison**, not as two countries with confirmed launch, and add any established market.
5. **Present the conflict and limits of evidence:** when a document says a feature exists while no connected path appears in the implementation, do not count them together as a complete feature. When a feature is ready in code and there is no deployment evidence, record the implementation and do not assume its launch. When the check is incomplete record `unknown`, not "does not exist". For every substantive finding give a local `path:line` reference or a direct external link, or a "hypothesis/recommendation" tag.

## What the report must include

Write in English and in the same order below. List Dorak's present strengths and weaknesses, and leave any binary verdict against a competitor for the next phase.

| Section | Required |
|---|---|
| **Executive summary** | What Dorak is, for whom, what problem it solves, the visible product model, the three strongest facts, the three biggest evidence gaps, and what decision the study allows. Separate the differentiation hypothesis from the proven feature. |
| **Company and evidence** | Product documents, the brand, domain, publisher and entity if documented, the review date and the version state. Do not estimate funding, the team or partnerships from Git or contributor counts. |
| **Platforms and availability** | A table for each platform and channel: the audience, what is built, what is published, the country, devices, language and RTL if shown, and the last update or rating or download if an official source exists. Do not count template pages or a WebView as an independent native app without evidence. |
| **Product and user experience** | The actual functions by customer, service provider/reception, management and finance, and marketing as the product shows. The core journey maps, alternative, rejection and failure cases, activation conditions, ease of discovery, accessibility, usability and localization. Add examples of behavior and their evidence, and do not invent results of a trial that did not take place. |
| **Market, customers and geography** | The segments, the problem they pay to solve, the buyer and the user, barriers to switching, market size through TAM/SAM/SOM from the number of eligible customers × actual or hypothetical income. Distinguish the size of the services sector, booked GMV, the software market value, and Dorak's revenue. When denominators are missing, give the formula and an evidence-gathering plan instead of a number. |
| **Competitors and positioning** | Identify 3–6 suitable alternatives including the direct competitor and a non-software alternative where applicable (for example WhatsApp and a notebook). Verify their claims through their sources when search is available, and compare positioning axes without issuing a final comparison with any competitor. Write a SWOT for Dorak and the most influential external factors, distinguishing evidence from hypothesis. |
| **Digital presence, marketing and ASO** | A site, blog, city and service pages if present; App Store and Google Play; Instagram, Facebook, LinkedIn, YouTube, X, TikTok, Snapchat and Telegram; WhatsApp and Google Business Profile where applicable. Classify each as a confirmed presence, an integration or link only, or not verified. Analyze the acquisition and conversion funnel for partners and customers, SEO/ASO and attribution. Do not assume that the presence of a pixel proves ads or conversions. |
| **Revenue model, pricing and feasibility** | What is documented of subscription, commission, payment, add-ons and their terms, versus proposed commercial options. Explain the purchase feasibility for a typical customer and the project's feasibility in three scenarios where reasonable assumptions can be formulated: income per account, direct cost, MRR/ARR, CAC, retention and churn, payback period, contribution margin and break-even. Use a clear currency unit and period, and separate order value, tax and provider dues from Dorak's revenue. If you do not know the real numbers, do not present the scenario as a financial forecast or a valuation of the company. |
| **Technology, security and operations** | What the code proves about domain boundaries, reference facts, concurrent booking if present, payment and settlement integrity if present, account and branch isolation, permissions and tests, architecture and scalability, monitoring, backups, devices and weak connectivity. Use the order **context → problem → risk → solution → proven or proposed example** for the main risks. Distinguish a written control from an applied and a monitored one, and do not present a penetration-test or compliance claim without proof. |
| **Privacy, compliance and risk** | What data is processed, consents and marketing opt-out, processors, export, deletion, transfer and retention, and which country or invoicing requirements apply. Add a risk table with impact, likelihood, evidence and a proposed owner. "We did not find a policy/control" is not a legal judgment and not proof that it is absent from production. |
| **Measurement and 90-day plan** | Priorities for 14/45/90 days, the key indicators and the definition of the denominator, protection indicators, and how to verify gaps at the lowest cost. Include testable differentiation proposals: a segment, a value hypothesis, an experiment, a success measure, and a cost or risk. |
| **Appendix: evidence and gaps** | A table of "unresolved question / its effect on the comparison / what is needed to verify / priority", with a statement of the scope actually examined. Provide a list of useful aggregate data: paying users/branches, acquisition, completed bookings or outcomes, retention, revenue, payment, support cost, and the country and channel distribution as applicable. |

## Feature matrix: the contract we will use in the comparison

Create a UTF-8 CSV in **exactly** this order. Each row represents a comparable capability, not a table or endpoint name or a mere idea. Split into more than one row for the same `feature_id` when there is a substantive difference between two countries or two platforms.

```csv
feature_id,domain,feature,actor,platform,market,status,evidence_type,release_status,plan_or_condition,evidence_ref,limitations
```

**Field definitions:**

- `status` is one of: `observed` (the capability or its outputs were seen directly in an interface or a check), `implemented` (a connected executable path in the source, without claiming it is deployed), `declared` (an announcement, document or store description only), `partial` (implementation or observation of a substantive part, naming what is missing), `not_found` (a documented search in the expected scope and the feature did not appear), `unknown` (the evidence or scope of the check is insufficient). Do not treat `declared` or `unknown` as zero or as a complete feature.
- `evidence_type` use what applies of `public_ui`, `runtime`, `source_code`, `tests_read`, `tests_run`, `vendor_docs`, `project_docs`, `store_listing`, `regulator`, `analytics`, `none`. Separate multiple types with a semicolon. Do not consider a test alone as deployment evidence.
- `release_status` is one of `live_observed` (the feature observed on a live public interface), `production_verified` (the feature's operational launch is established in a known production environment), `publicly_listed` (a store listing or a public offer only), `unverified`, `not_applicable`. Not every announced feature or feature in code is released.
- `platform` such as `customer_web`, `partner_web`, `branded_web`, `customer_android`, `partner_android`, `customer_ios`, `partner_ios`, `whatsapp`, `instagram`, `api`, `multi`, `unknown`. In `market` use `SA`, `SY`, `unknown` or a confirmed country code, and `market_agnostic` only if the capability is truly not tied to a country. Tie any plan, country, account or integration restriction in the `plan_or_condition` field.
- `evidence_ref` `path:line` paths or direct public links, with a semicolon for multiple references. If there is no positive evidence, state the search scope or the reason for the missing reference in `limitations`. Use a human-readable English label in `feature` and explain in `limitations` whether the feature is core to the product or outside its audience's scope; do not count the absence of an out-of-scope feature as an automatic flaw.

Use the following comparison identifiers as they are and list each of them at least once, even if the result is `unknown` or `not_found`. Add Dorak capabilities that the dictionary does not cover with `DORAK.*` identifiers, name them by their usefulness and document them to the same standard.

| Domain | Identifiers and meaning |
|---|---|
| **Platforms** | `PLAT.CUSTOMER_WEB` customer web; `PLAT.PARTNER_WEB` partner web; `PLAT.CUSTOMER_ANDROID` and `PLAT.PARTNER_ANDROID` the two Android apps; `PLAT.CUSTOMER_IOS` and `PLAT.PARTNER_IOS` the two iOS/iPad apps; `PLAT.BRANDED_WEB` a site under the establishment's name. |
| **Marketplace** | `MKT.DISCOVERY` search and discovery; `MKT.LISTING` establishment page, services, prices and durations; `MKT.REVIEWS` ratings; `MKT.OFFERS` offers; `MKT.SERVICE_MODES` in-establishment/at-home if applicable; `MKT.BOOKING_ATTRIBUTION` separating a booking from the marketplace from a direct one. |
| **Booking** | `BOOK.SELF_SERVICE` starting a self-service booking; `BOOK.AVAILABILITY` real calendar availability; `BOOK.STAFF_SELECTION` staff choice or assignment; `BOOK.RESOURCES` scheduling rooms/equipment; `BOOK.CONFIRMATION` instant booking or an approval path; `BOOK.CHANGE_CANCEL` change/cancellation; `BOOK.REMINDERS` confirmations and reminders; `BOOK.DEEP_LINKS` links leading to a specific service/booking. |
| **Operations** | `OPS.CRM` customer record and history; `OPS.BRANCHES` multiple branches; `OPS.STAFF` team, schedules, attendance and commissions; `OPS.INVENTORY` inventory and consumption; `OPS.PACKAGES` packages and memberships; `OPS.GIFTS` gifts; `OPS.LOYALTY` loyalty; `OPS.REPORTING` operations and performance reports. |
| **Finance** | `PAY.ONLINE` electronic payment or a link; `PAY.DEPOSITS` deposit; `PAY.POS` point of sale; `PAY.TERMINAL` a payment terminal tied to the invoice; `PAY.ACCOUNTING` accounting and collection reconciliation; `PAY.EINVOICE` electronic invoicing. |
| **Messaging and growth** | `GROWTH.INBOX` unified inbox; `GROWTH.WHATSAPP_BOOKING` booking from a WhatsApp conversation; `GROWTH.CAMPAIGNS` scheduled or custom campaigns; `GROWTH.RECOVERY` follow-up of incomplete bookings; `GROWTH.TRACKING` conversion sources and tracking tools. |
| **Artificial intelligence** | `AI.CUSTOMER_AGENT` customer agent; `AI.STAFF_ASSISTANT` analytical/operational assistant for staff with review of actions when needed. |

### Required outputs and acceptance criteria

- `dorak-study.md`: an independent English study covering the axes above, with its references inside the text, and the search results, their limits and the snapshot date.
- `dorak-feature-matrix.csv`: the matrix, with the specified column headers, a CSV integrity check and identifier coverage.
- The only allowed output paths for a future run are `docs/product-research/dorak/dorak-study.md` and `docs/product-research/dorak/dorak-feature-matrix.csv`. Write nothing else, and write all human-readable text, including the CSV fields `feature`, `plan_or_condition` and `limitations`, in English.
- Do not overwrite either file if it already exists; stop and ask for approval first. Application code and every other repository file stay read-only during the study.
- Do not read any competitor study (`docs/competitor-analysis/`), including the Toptalla findings and its feature baseline, while collecting Dorak's evidence or writing the study. This study must be independent of them; any comparison is a later, separate stage.
- Before finishing: review consistency of results between the two files, the correctness of the formulas and numbers, source links and line references, and state what was not tested. End with a short message: what Dorak clearly does, the main strengths and weaknesses on their evidence, and what is needed before judging its ability to compete. Do not perform any comparison with a competitor now.
