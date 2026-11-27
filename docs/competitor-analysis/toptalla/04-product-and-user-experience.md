---
codeanchors:
  - docs/competitor-analysis/
---

# Toptalla: product, functions and user experience

Routes: [Toptalla hub](index.md) · [competitor analysis](../index.md) · previous: [03 Platforms and availability](03-platforms-and-availability.md) · next: [05 Market and geography](05-market-and-geography.md)

**Scope of this file:** what each party (customer, front desk and staff, management and finance, marketing and AI) gets, what the web sample showed, and what the published case studies claim. Plans and prices behind these features are in [08](08-pricing-and-contracting.md); the architecture needed to deliver them is in [10](10-technical-architecture.md); the test plan for the "what to test" column is in [12](12-validation-plan-and-metrics.md).

## What each party gets

The same capabilities, one row per feature, market and platform with status and evidence, are in the [feature baseline matrix](feature-baseline.csv).

| Party | What is announced | What must be tested |
|---|---|---|
| **Customer** | Discovery by area and service, photos, prices, durations and ratings, offers or packages, choice of specialist and time, and payment according to the center's policy ([Saudi marketplace](https://toptalla.com/ar/places?countryCode=SA), [online booking](https://business.toptalla.com/ar/features/online-booking)). | How many steps to a first booking? Are the final price, deposit and cancellation terms visible before confirmation? Can the customer rebook without re-entering data? |
| **Front desk and staff** | A calendar for branches, staff and resources, choosing or assigning the provider, instant or approval-based booking, a customer record and reminders; and TopConnect to route WhatsApp and Instagram conversations, depending on activation ([online booking](https://business.toptalla.com/ar/features/online-booking), [customer record](https://business.toptalla.com/ar/features/client-management), [TopConnect](https://business.toptalla.com/ar/features/topconnect)). | Concurrent bookings, breaks and leave, a shared room, cleaning time between services, conversation handover, and what each job role can see. |
| **Management and finance** | Point of sale, inventory, attendance and commissions, products, packages, gifts and loyalty, accounting and invoicing, and linking a payment terminal to the invoice through TopPay when activated ([plans](https://business.toptalla.com/ar/pricing), [TopPay](https://business.toptalla.com/ar/features/pos-terminal-integration)). | Daily close, mixed or partial payment, refunding a payment, collection reconciliation, material deduction, invoice correction, and branch isolation. |
| **Marketing and AI** | Campaigns and follow-up of incomplete bookings according to the plan, a WhatsApp booking agent with limits and permissions, and a staff assistant for analysis and suggesting reviewable actions ([plans](https://business.toptalla.com/ar/pricing), [booking agent](https://business.toptalla.com/en/features/ai-booking-assistant), [staff assistant](https://business.toptalla.com/en/features/ai-staff-assistant)). | Arabic and dialects, not inventing a price or time, handover to a human, honoring message opt-out, and not executing an action outside the employee's permission. |

## What the web sample showed

- **Saudi Arabia:** the example "Anti Raqiya Salon" shows service details, prices and durations, and the Sand spa example shows how a brand's customer goes straight to a site named after the center instead of starting the journey from a public directory ([salon page](https://toptalla.com/ar/salon/salwn-anty-raqyh), [Sand spa site](https://sandspa.my.toptalla.com/ar)).
- **Syria:** in the `wavy salon` sample in Mezzeh, the "Book now" button opened the services section, and choosing a service showed a continue button leading to the specialist-selection path. The test environment did not show the next stage in a way that allowed confirming an appointment; no phone number was entered and no booking or payment was submitted. The booking-stage tab title also pointed to Saudi Arabia in this Syrian sample, a localization point worth reproducing on real devices before generalizing ([the salon page where the sample began](https://toptalla.com/ar/salon/wavy-salon?countryCode=SY)).
- **Cancellation and no-show:** the product announces the ability to link a deposit, reminder and cancellation policy; do not assume every salon applies the same terms or that changes and refunds are always automatic ([no-show reduction feature](https://business.toptalla.com/en/features/no-show-protection), [marketplace terms of use](https://toptalla.com/ar/policies/terms-and-conditions)).
- **Accessibility:** no confirmed accessibility features from the developer appear on the Saudi partner app page ([Apple page for partners](https://apps.apple.com/sa/app/toptalla-business/id6448799066)). Testing is needed for screen reader, contrast, font enlargement, focus order, calendar keyboard navigation, and RTL direction when phone numbers, currencies and Arabic are mixed; this describes a test plan, not a passed result.

## What the published case studies say

- **SandSpa:** the company story says payment links replaced passing around transfer screenshots and manual matching, and that cancellations fell after online payment was widened. The story gives no before-and-after figure and no independent measurement ([SandSpa story](https://business.toptalla.com/en/customer-stories/sandspa)).
- **Tafasil Rose:** the vendor states an initial nail-section occupancy of **45–50%** and initial monthly sales of **SAR 140–160 thousand**, then a space allocation shifted toward more-requested services; it does not publish the sales figure after the change. The monthly range must not be treated as Toptalla revenue, nor as an improvement percentage caused by the system ([Tafasil Rose story](https://business.toptalla.com/en/customer-stories/tafasil-rose)).

These stories are marketing material with a commercial interest, so they are low-weight evidence (see [02 Company and evidence](02-company-and-evidence.md)). The claims that matter for a decision, such as fewer cancellations, are turned into measurable before-and-after tests in [12 Validation plan and metrics](12-validation-plan-and-metrics.md).
