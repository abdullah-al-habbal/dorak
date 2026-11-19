---
nodeid: docs.competitor-analysis.toptalla.market-and-geography
parentnode: docs.competitor-analysis.toptalla
childnodes: []
codeanchors:
  - docs/competitor-analysis/
---

# Toptalla: market, users and geographic feasibility

Routes: [Toptalla hub](index.md) · [competitor analysis](../index.md) · previous: [04 Product and user experience](04-product-and-user-experience.md) · next: [06 Competitors and positioning](06-competitors-and-positioning.md)

**Scope of this file:** Saudi Arabia versus Syria, the customer segments and what each would pay for, and a bottom-up market sizing. Price points that feed the sizing example are in [08](08-pricing-and-contracting.md); the subscription economics are in [09](09-financial-feasibility.md); the regulatory side of the two countries is in [11](11-privacy-compliance-and-risk.md).

## Saudi Arabia and Syria

| Axis | Saudi Arabia | Syria |
|---|---|---|
| **Published supply** | 42 results on the filtered page at the time of inspection, including examples from Riyadh and other regions; not a national census of the sector ([Saudi catalog](https://toptalla.com/ar/places?countryCode=SA)). | 29 results on the Damascus page at the time of inspection, with examples from Mezzeh, Barzeh and Saruja. The filtered Syrian page showed the same number, so the two figures are not added ([Damascus](https://toptalla.com/ar/places/in-damascus-sy), [Syria filter](https://toptalla.com/ar/places?countryCode=SY)). |
| **Payment infrastructure** | The Saudi central bank announced that electronic payments made up **85%** of retail payments in 2025 versus **79%** in 2024 ([SAMA](https://www.sama.gov.sa/en-us/mediacenter/news/pages/news-1139.aspx)). This is an indicator of infrastructure and payment habit, not of paying for salon bookings. | There is an oversight framework for electronic payment and local services such as Syriatel Cash ([Central Bank of Syria](https://www.cb.gov.sy/en/pages/623), [Syriatel Cash](https://www.syriatel.sy/services/syriatel-cash)). Toptalla's integration of these services was not verified. |
| **Testable entry hypothesis** | Start in Riyadh with a multi-staff care-center segment: deposit, payments and settlements, reports and WhatsApp. Measure the difference from current tools before widening the launch. | Start in a small geographic cluster in Damascus, test booking through a light link and payment at the center, then trial any local payment with a clear contract and settlement requirements. Do not copy Saudi pricing or flows directly. |

## Segments and what they pay for

- **Freelancer or small barber:** buys speed of start, a simple schedule and a single booking link; the biggest risk is paying fees for units they do not need. Test the effect of eliminating manual calls and messages before suggesting a higher plan.
- **Mid-size independent salon:** buys clarity of team working hours, reminders and deposit, cash-register close, and following up customer return. This segment is the candidate for the first trial because the value of the system can be tied to a single working day.
- **Chain or spa with shared resources:** buys branch separation, permissions, occupancy control, consolidated reports and payment settlement. The chance of a larger contract is matched by costlier selling, migration and support.
- **Beauty clinic:** keep commercial booking separate from any medical file or sensitive data; including clinics in the marketing message does not prove the product is suitable for managing a medical file or meeting the sector's requirements ([Toptalla positioning](https://www.linkedin.com/company/toptalla), [SDAIA data-protection regulations](https://sdaia.gov.sa/en/SDAIA/about/Pages/RegulationsAndPolicies.aspx)).

## Bottom-up market estimate

Al Eqtisadiah, citing the Ministry of Commerce, reported about **18.3 thousand active registrations for women's salon activity** at the end of 2024, about **47.7 thousand active registrations for men's salons** at the end of 2024, and about **49 thousand** of them at the end of Q1 2025. These are activity registrations at specific dates, not an inventory of open or sellable branches, and there is no justification for using them as a Toptalla market share ([women's registrations](https://www.aleqt.com/2025/03/13/article_2758451.html), [men's registrations](https://www.aleqt.com/2025/06/07/article_2762260.html)).

| Level | Method of measurement | Hypothetical worked example, not an actual estimate |
|---|---|---|
| **TAM** | Number of eligible establishments after cleaning the registrations × a weighted annual subscription income per site. | If 18,300 women's registrations are used as a rough proxy and SAR 1,800 per year, the result is **SAR 32.94 million per year** for this segment only. |
| **SAM** | Eligible branches in the served cities × a fit-and-payment ratio × average income. | If 2,000 branches matching the segment are established and the price is SAR 1,800, the result is **SAR 3.6 million per year**. The branch count here is hypothetical. |
| **SOM** | Your actual ability to acquire, onboard and retain, not an arbitrary percentage of the market. | 200 paying, active branches × SAR 1,800 = **SAR 360 thousand ARR** for the software, without commissions or payment fees. |

Consumer spending on beauty services must not be used as the revenue of the software market. In Syria, no published census that can be relied on for this segment was found; the practical alternative is a field inventory in selected neighborhoods, removing duplicates, and interviews about the current booking system and readiness to pay.

The per-branch revenue behind the SOM row is developed into scenarios in [09 Financial feasibility](09-financial-feasibility.md).
