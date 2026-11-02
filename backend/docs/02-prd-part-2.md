---
nodeid: backend.02-prd.part-2
parentnode: backend.02-prd
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 8 · [02 — Product Requirements Document (PRD)](02-prd.md) · [Previous](02-prd.md) · [Next](02-prd-part-3.md)

## 3. User types (personas)

Full narratives in `03-persona-journeys.md`; permission rules in `04-house-rules.md`.

| Persona | Who they are | Primary need | Lives in |
|---|---|---|---|
| **Client** | A man or woman seeking grooming/beauty | Find a nearby shop, see who's free, book without waiting | Mobile app |
| **Brand Owner** | Owns the business (1 → many branches) | Operational control across all branches; grow without pain | Admin panel |
| **Branch Manager** | Runs day‑to‑day at one branch | Manage that branch's seats, hours, staff, bookings | Admin panel |
| **Barber / Stylist** | Independent professional | Own profile & services; work freelance/at‑home and/or for shops; find work | Mobile app (+ light panel) |
| **Platform Admin** | Dorak operator | Onboard tenants, moderate, manage currencies & flags | Admin panel |

---

## 4. MVP scope (detailed)

### 4.1 Storefront & hierarchy ✅
- Create a **Brand**; the system auto‑creates **exactly one Branch** (Branch‑First).
- Branch carries: bilingual name, **gender category** (`men_only` / `women_only` / `unisex`), location (coordinates), opening/closing hours, settings.
- Define **chairs/seats** for the branch, each with a position for the visual floor plan and a status (`available` / `occupied` / `maintenance`).
- Define **services** (bilingual name, price, currency, optional `at_home`).

### 4.2 Discovery & search ✅
- Client **home feed** ranks shops by **proximity**, filtered by the chosen **universe**.
- **Search bar queries Branches first** (a client visits a *building*, not a corporation), matching **branch name + brand name + tags** together, and **also surfaces freelance barbers** (who may have no fixed address). See [§7 Resolved Decisions](02-prd-part-3.md#7-resolved-decisions).

### 4.3 Visual floor plan + booking ✅
- Opening a branch shows a **top‑down floor plan**: abstract shapes + chairs colored by live status (**green = free now**).
- Tapping a free chair reveals the **linked barber** (if any) and the relevant **services**, then opens a **booking** for a time slot.
- A client who prefers a **specific barber** can book **by that barber** rather than by chair.
- **Double‑booking is impossible** (see NFR §9 and `04-house-rules.md`).

### 4.4 Standalone & at‑home barbers ✅
- A barber owns a profile, portfolio, settings, and **their own services**.
- A **freelancer** can offer **at-home** services with a travel radius; checkout requires GPS coordinates plus street, building, and unit/apartment text instead of a floor-plan chair.

### 4.5 Bilingual & currency ✅
- All user‑facing names/descriptions are **translatable (Arabic + English)** with fallback.
- A **base currency** per brand; services priced in a currency; a global **exchange‑rate** layer converts **on the fly**. A shop may opt to **show both** currencies.

### 4.6 Roles & access ✅
- Brand Owner > Branch Manager > Barber > Client, plus Platform Admin (see `04-house-rules.md`).

### 4.7 Reviews 🟢 (early Phase 2)
- **Two‑way** after a completed appointment: client rates shop; shop rates client.

### 4.8 Simple jobs & invitations 🟢 (early Phase 2)
- A branch can **post a job** (open/closed). A barber taps **Apply** → a snapshot of their profile reaches the owner's dashboard. *No ATS.*
- A shop can **invite** a barber to affiliate; the barber **accepts/rejects**.

---
