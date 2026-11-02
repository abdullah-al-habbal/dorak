---
nodeid: backend.04-house-rules
parentnode: backend.docs
childnodes:
  - backend.04-house-rules.part-2
  - backend.04-house-rules.part-3
codeanchors:
  - backend/modules/
---

# 04 — House Rules (The Business Laws)

> The **unshakeable laws** of how Dorak operates, written as simple **If / Then** statements. The test: *if a child can understand the rule, it's written correctly.*
> These freeze product logic. They are the source of truth for behavior; entities are in `06-entity-model-abstract.md`, flows in `07-user-flows.md`, hard situations in `08-edge-cases.md`.

---

## A. Brands & branches (the Branch‑First law)

- **A1.** If someone creates a Brand, then the system also creates **exactly one Branch** for it automatically.
- **A2.** If a Brand exists, then it **always has at least one Branch** — there is no Brand with zero branches, ever.
- **A3.** If a Brand wants a **second** Branch, then the **multi‑branch** feature must be turned on for that Brand.
- **A4.** If a Brand grows from one Branch to many, then **no old data is moved or lost** — new branches are simply *added* under the same Brand.
- **A5.** If a Branch is created, then it must have a **gender category**: men‑only, women‑only, or unisex.
- **A6.** If a Brand is deleted, then **its branches and chairs are deleted with it** — but **barbers are not** (barbers are independent; see Group C).

---

## B. Chairs & seats

- **B1.** If a Chair exists, then it **belongs to exactly one Branch**.
- **B2.** If a Chair is shown on the floor plan, then its color reflects its **current status**: green = free now, otherwise not free.
- **B3.** If a Chair's status is **maintenance**, then **no one can book it**.
- **B4.** If a Chair has a barber linked, then tapping it shows **that barber and their services**.
- **B5.** If a Chair has **no** barber linked, then tapping it shows the shop's general services (or an "unassigned" state).
- **B6.** If a Branch has no chairs yet, then clients can see the storefront but **cannot book a chair** there.

---

## C. Barbers & affiliations (the Standalone law)

- **C1.** A Barber is an **independent person**, not a part of any shop.
- **C2.** If a Barber has no shop, then they can **still exist, have a profile, and offer their own services** (including at‑home).
- **C3.** If a Barber joins a shop, then this is recorded as an **affiliation link** — the Barber may be linked to **a whole Brand** or to **a specific Branch**.
- **C4.** If a Barber is talented and busy, then they may be affiliated with **more than one** Brand or Branch at the same time.
- **C5.** If a Barber **leaves** a shop, then **only the affiliation ends** — the Barber's profile, portfolio, and personal services **stay intact**.
- **C6.** If a Barber is linked to a Chair, then that link is for **working at that station** — it does not make the shop own the Barber.
- **C7.** If a Barber marks themselves a **freelancer**, then they can offer **at‑home** service within a travel radius.

---

## D. Services & pricing

- **D1.** If a Service exists, then it is owned by **either a Brand or a Barber** — never floating with no owner.
- **D2.** If a Service has a price, then that price is stored in **one chosen currency**.
- **D3.** If a Brand exists, then it has **one base currency**.
- **D4.** If a client views a price in a different currency, then the system **converts it on the fly** using the current exchange rate — prices are **never hard‑coded** across currencies.
- **D5.** If a shop chooses dual display, then the client sees **both** the base price and the converted price.
- **D6.** If a Service is marked **at‑home**, then booking it captures the **client's location** instead of a chair.

---

## Continued in

- [Part 2: E. Bookings (the no‑double‑booking law)](04-house-rules-part-2.md)
- [Part 3: J. Language & universes](04-house-rules-part-3.md)
