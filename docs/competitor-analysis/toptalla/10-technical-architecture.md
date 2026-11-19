---
nodeid: docs.competitor-analysis.toptalla.technical-architecture
parentnode: docs.competitor-analysis.toptalla
childnodes: []
codeanchors:
  - docs/competitor-analysis/
---

# Toptalla: technical and security study

Routes: [Toptalla hub](index.md) · [competitor analysis](../index.md) · previous: [09 Financial feasibility](09-financial-feasibility.md) · next: [11 Privacy, compliance and risk](11-privacy-compliance-and-risk.md)

**Scope of this file:** a proposed reference architecture for evaluating or building a similar product. It is not Toptalla's internal architecture, and a public interface or a store record is not enough to prove technologies, tables or system guarantees. Disclosure and compliance findings about the real product are in [11](11-privacy-compliance-and-risk.md); the capabilities these designs support are in [04](04-product-and-user-experience.md).

## Reference architecture

- **Appointment and resource availability:** the problem is that booking from an app, a website and a staff member may compete for the same staff member and room. The solution: a single write source for booking, in which matching and availability are re-checked inside the transaction for each resource, with overlap prevention inside the database or a disciplined lock and a temporary hold period. Search may show a read copy, but do not rely on it for confirmation. Example: if two customers choose the same room and time, one succeeds and the other receives alternatives.
- **Payment and settlement:** separate `Booking`, `Payment` and `Invoice` and their states, and use idempotency keys, trusted verification of the payment provider's notification, a ledger that is not directly editable, and periodic reconciliation with the provider. Example: a payment event arriving after the slot hold has expired does not confirm the appointment automatically; it has a specific review or refund path.
- **Modules and scaling:** start with a clear-module Modular Monolith: `Scheduling`, `Customer`, `Billing`, `Messaging` and `Marketplace`. Tie asynchronous effects to a Transactional Outbox, use a relational database for invoices and bookings, composite indexes by tenant, branch and appointment, and separate read projections if measurement proves the need. Do not start with database or service sharding before measuring load and bottlenecks.
- **Data isolation and localization:** implement permissions by tenant, branch and role at the query level, with audit logs and export permissions, and tests that prevent crossing branches. Store time as a reference with an IANA zone per branch, and store an amount in an exact representation with an explicit currency code; separate country templates, payment contracts and invoice rules.
- **Mobile and compatibility:** give the app interfaces clear version contracts, keep web booking available without a download, with deep links and back options. On a weak connection, allow limited display and make clear that the slot is not confirmed until the server answers; do not record a successful payment locally by assumption. Test updating, RTL, zoom and screen reader on real devices.
- **Artificial intelligence:** do not give the model direct permission to create a payment, a discount or edit a record. Tie prices and availability to a system read, use permission-scoped actions that the domain layer verifies, require human review on ambiguity, and keep a trace of who proposed and who approved. Set a policy to mask identifiers, minimize conversation content, and stop the agent when needed.
- **Measurement and continuity:** monitor availability latency and appointment creation, conflicts, expired temporary holds, delay of confirmation messages and the rate of financial-reconciliation errors; tie booking, payment and reminder logs with a correlation id without leaking customer data. Test backup restoration and failure of the payment and messaging providers. Define a written SLA and RPO/RTO instead of assuming them.

## How this relates to the rest of the study

These designs are what make the claims in [04 Product and user experience](04-product-and-user-experience.md#what-each-party-gets) testable: double booking, partial payment, branch isolation and AI limits. The failure scenarios in the validation plan ([12](12-validation-plan-and-metrics.md)) exercise exactly these mechanisms, and the risk owners in [11](11-privacy-compliance-and-risk.md#priority-implementation-risks) map to them.
