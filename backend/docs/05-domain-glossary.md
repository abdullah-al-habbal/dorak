---
nodeid: backend.05-domain-glossary
parentnode: backend.docs
childnodes:
  - backend.05-domain-glossary.part-2
codeanchors:
  - backend/modules/
---

# 05 — Domain Glossary (The Bounded Vocabulary)

> One agreed meaning per term. When anyone says these words — in docs, in meetings, in the product — they mean **exactly** this. Treat it as the project's shared dictionary.
> Where a term has an Arabic equivalent the team uses, it's noted in parentheses.

---

## Core hierarchy

- **Brand** (العلامة / المنشأة) — The business itself; the **tenant**. Owned by one person (the Owner). Holds the base currency and feature flags. **Always owns at least one Branch.**
- **Branch** (الفرع) — A **physical location** of a Brand. Has its own address/coordinates, hours, gender category, settings, chairs, and (optionally) a manager. The thing a client actually visits.
- **Chair / Seat** (الكرسي) — A physical station inside a Branch and the **anchor of the visual floor plan**. Has a position, a status (available / occupied / maintenance), and may be linked to a Barber.
- **Tenant** — Synonym for **Brand** in the SaaS sense: the unit of data isolation. One tenant cannot see another's data.

## People & roles

- **Client / Customer** (العميل) — A person seeking grooming or beauty services. Discovers shops, books, and reviews.
- **Brand Owner** (المالك) — The person who owns the Brand. Top authority over **all** its branches, billing, managers, jobs, and affiliations.
- **Branch Manager** (مدير الفرع) — Runs the day‑to‑day of **one** Branch. Deep but **local** authority; cannot act brand‑wide.
- **Barber / Stylist** (المصفف; the code and API say `barber`, the Arabic UI never says الحلاق) — An **independent professional**. May be freelance (incl. at‑home), affiliated with shops, or both. Owns their own profile, portfolio, and services regardless of affiliation. *(In this product "Barber" covers both men's barbers and women's stylists.)*
- **Freelancer** — A Barber operating independently, not requiring any shop affiliation; can offer **at‑home** service.
- **Platform Admin** — The Dorak operator. Manages tenants, currencies, exchange rates, and feature flags across the whole platform.

## Relationships & links

- **Affiliation** (الارتباط) — The **link** between a Barber and a Brand **or** a Branch. It is just a relationship (with a status), **not ownership** of the Barber. A Barber may have **many** affiliations at once.
- **Affiliation status** — Where an affiliation stands: **pending** (invited, not yet answered), **active** (working), or **terminated** (ended). Ending an affiliation never deletes the Barber.
- **Invitation** — A shop's request for a Barber to affiliate. Sits as **pending** until the Barber accepts or rejects.
- **Application** — A Barber's response to a posted Job: tapping **Apply** sends a **profile snapshot** to the shop. (Deliberately lightweight — *not* an ATS.)

## Catalog & money

- **Service** (الخدمة) — Something offered for a price (haircut, beard trim, makeup, etc.). Owned by **either a Brand or a Barber**. May be flagged **at‑home**.
- **At‑home service** (خدمة منزلية) — A Service the Barber performs at the **client's location**; booking it captures the client's location instead of a chair.
- **Currency** (العملة) — A money unit the platform supports (e.g., SYP, USD).
- **Base currency** — The single currency a Brand prices in by default.
- **Exchange rate** (سعر الصرف) — The conversion factor from one currency to another, used to display prices in another currency **on the fly**.
- **Dual display** — A shop setting that shows a price in **both** the base and converted currencies.

## Booking

- **Booking / Reservation** (الحجز) — A client's claim on a **specific chair + time slot** (or on a **specific Barber**, or an **at‑home** visit). For MVP it is a *reservation*, not a payment.
- **Time slot** — The specific time a Booking occupies.
- **Double‑booking** — Two clients holding the **same chair + slot**. This must be **impossible**: exactly one wins.
- **No‑show / Cancellation** — A booked appointment that didn't happen because the client didn't arrive or cancelled.

## The visual engine

- **Floor plan** (مخطط الصالة) — The **top‑down visual layout** of a Branch: abstract shapes plus chairs colored by live status. Tapping a chair reveals barber + services and opens booking.
- **Backend‑driven UI** — The principle that the **backend describes** what the floor plan looks like (shapes, positions, colors, status) and the **app simply draws it**, rather than each shop's screen being hand‑built.
- **UI metadata** — The plain description a Chair (or decoration) carries so it can be drawn: its shape and position on the floor plan, and whether it's interactive.

## Continued in

- [Part 2: Product controls](05-domain-glossary-part-2.md)
