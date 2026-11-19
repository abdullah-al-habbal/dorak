---
nodeid: docs.competitor-analysis.toptalla.privacy-compliance-and-risk
parentnode: docs.competitor-analysis.toptalla
childnodes: []
codeanchors:
  - docs/competitor-analysis/
---

# Toptalla: privacy, compliance and risk

Routes: [Toptalla hub](index.md) · [competitor analysis](../index.md) · previous: [10 Technical architecture](10-technical-architecture.md) · next: [12 Validation plan and metrics](12-validation-plan-and-metrics.md)

**Scope of this file:** what the public disclosures and legal documents show, what to do about each issue before production, and the priority risks with owners. It is not a legal or security audit. The technical controls behind the actions are in [10](10-technical-architecture.md); the contract line items are in [08](08-pricing-and-contracting.md).

## Privacy and compliance study

| Issue | What appeared | Action before production |
|---|---|---|
| **Android partner encryption** | The Saudi Google Play page states "data is not encrypted" and that no data is collected, with the possibility that personal data, messages, photos and video are shared. The customer app declares encryption in transit; Apple's disclosures for partners list user-linked categories such as location, contact and financial data ([Google Play partners](https://play.google.com/store/apps/details?id=com.toptalla.business&hl=ar&gl=SA), [Google Play customers](https://play.google.com/store/apps/details?id=com.toptalla.marketplace&hl=ar&gl=SA), [Apple partners](https://apps.apple.com/sa/app/toptalla-business/id6448799066)). | Treat it as a disclosure discrepancy that requires a written answer, not as proof of a vulnerability or a uniform description of all channels. Ask for an explanation of the scope of transport, storage and backup, and samples of controls or a suitable certificate. |
| **Data policy and contracts** | The privacy policy covers the marketplace, partners and the site, and describes account, transaction and contact data and their use. The business terms refer renewal and cancellation details to the purchase agreement and do not guarantee uninterrupted operation; the consumer terms distinguish the platform from the service provider ([privacy policy](https://business.toptalla.com/en/privacy-and-cookie-policy), [business terms](https://business.toptalla.com/en/terms-of-service), [marketplace terms](https://toptalla.com/ar/policies/terms-and-conditions)). | Ask for a data-processing agreement, the roles of the parties, the list of processors, storage and transfer regions, retention and deletion of data, export rights, incident notification, and an SLA and dispute-response mechanism. |
| **Saudi Arabia: PDPL and invoicing** | SDAIA publishes the data-protection law and its regulations, and ZATCA describes e-invoicing in two phases and the rollout of the integration phase in waves ([SDAIA](https://sdaia.gov.sa/en/SDAIA/about/Pages/RegulationsAndPolicies.aspx), [ZATCA phases](https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/Roll-out-phases.aspx)). | Do not equate an announcement of invoicing availability with suitability for the tax entity or its wave; test correction, credit notes, a different branch status, and defining the legal basis for marketing and data transfer. |
| **Syria: settlement and local operations** | There are local listing pages and the regulator oversees electronic payments; presence in the catalog does not prove that a specific payment gateway is available ([Syria listing](https://toptalla.com/ar/places?countryCode=SY), [Central Bank of Syria](https://www.cb.gov.sy/en/pages/623)). | Verify the selling entity, the collection partner, currencies, the refund mechanism, data protection and local and contractual requirements; start with a simple fallback path before financial automation. |
| **External channels** | TopConnect mentions the official Meta integration and a QR option, and availability varies by plan and account ([TopConnect](https://business.toptalla.com/ar/features/topconnect), [plans](https://business.toptalla.com/ar/pricing)). | Decide who owns the number, the business account and the message templates; adopt a clear linking path that can be detached and moved, and a fallback plan for the booking path if the channel stops. |

## Priority implementation risks

The priority risks: double booking or a payment with no appointment, salons leaving after a failed migration, weak supply density, and unexpected messaging and support costs. For each risk assign an owner and a warning indicator:

| Risk | Owner | Warning indicator |
|---|---|---|
| Appointment conflict (double booking, payment without an appointment) | Technology lead | Conflict rate, expired temporary holds, orphaned payments (see [10](10-technical-architecture.md)) |
| Unresolved settlements | Finance | Reconciliation errors and open settlement items |
| Activation and retention failure after migration | Customer success | Time to first value, 30/90-day retention |
| Weak supply density | Growth | Completed bookings by neighborhood |
| Unexpected messaging or support cost | Finance and customer success | Messages over quota, tickets per branch (see [08](08-pricing-and-contracting.md)) |

The gates that stop a rollout on these risks are defined in [12 Validation plan and metrics](12-validation-plan-and-metrics.md).
