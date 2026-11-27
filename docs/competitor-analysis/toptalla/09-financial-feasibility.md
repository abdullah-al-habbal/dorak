---
codeanchors:
  - docs/competitor-analysis/
---

# Toptalla: financial feasibility

Routes: [Toptalla hub](index.md) · [competitor analysis](../index.md) · previous: [08 Pricing and contracting](08-pricing-and-contracting.md) · next: [10 Technical architecture](10-technical-architecture.md)

**Scope of this file:** two worked examples, both hypothetical: whether a salon should buy, and whether a comparable product would be viable. Neither reveals Toptalla's real revenue or costs. The prices behind them are in [08](08-pricing-and-contracting.md); the market sizing is in [05](05-market-and-geography.md); the real data that should replace the assumptions is listed in [12](12-validation-plan-and-metrics.md).

## Feasibility of purchase for the salon

A hypothetical monthly example: if automation recovers **5 visits** at a contribution margin of **SAR 70 per visit**, and saves **6 hours** valued at **SAR 35 per hour**, and the computed subscription is **SAR 150** and the extra costs are **SAR 70**, the approximate net monthly value is **SAR 340**. Use the visit margin after variable cost, and do not treat saved time as cash if you cannot reuse it. Compare four weeks before and after on the same services, branches and days of the week, and exclude seasonality and offers as far as possible.

## Feasibility of a comparable project

The model below is entirely hypothetical and does not imply Toptalla's revenues or real costs. Figures are in riyals, before value-added tax, and exclude marketplace fees or payment margins; they assume **a subscription income of SAR 150 per month for each paying branch** and **SAR 30 thousand of fixed costs per month**.

| Indicator | Conservative | Base | Growth |
|---|---:|---:|---:|
| Paying branches | 50 | 200 | 500 |
| Subscription MRR / ARR | 7,500 / 90,000 | 30,000 / 360,000 | 75,000 / 900,000 |
| Monthly direct cost per branch | 45 | 40 | 35 |
| Monthly contribution per branch | 105 | 110 | 115 |
| CAC / months to recover it | 600 / 5.7 | 800 / 7.3 | 1,000 / 8.7 |
| Monthly branch churn | 5% | 3% | 2% |
| Approximate LTV ÷ CAC | 3.50× | 4.58× | 5.75× |
| Monthly result before branch acquisition and other costs | −24,750 | −8,000 | +27,500 |

In the base case, the break-even point is about **273 branches** before the cost of replacing departing branches, and it rises to **349** if one assumes replacing 3% monthly churn at a cost of SAR 800 per branch, which is SAR 24 per month per existing branch. The \(LTV\) calculation here is the monthly contribution divided by the monthly churn; it is approximate and assumes churn is constant, and is not a substitute for real retention curves. Higher acquisition spend, onboarding cost or messaging cost changes the result quickly, and a separate budget must be reserved for the build phase, data migration and support.

## Where the numbers go next

The break-even and payback figures feed the software metrics in [12 Validation plan and metrics](12-validation-plan-and-metrics.md#the-required-measurement-dashboard); the segment and branch assumptions come from [05 Market and geography](05-market-and-geography.md#bottom-up-market-estimate).
