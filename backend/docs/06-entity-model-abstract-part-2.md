---
codeanchors:
  - backend/modules/
---

Part 2 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract.md) · [Next](06-entity-model-abstract-part-3.md)

## 2. The entities (plain‑English objects)

### Foundations

**Client**
- identifier
- name, contact (phone and/or email)
- credentials (managed by auth — *not detailed here*)
- one or more **roles** (Brand Owner, Branch Manager, Barber, Client, Platform Admin)
- links to the profile(s) this client *is*: optionally a **Barber**
- a **Settings** record
> One phone number may hold both Client and Barber profiles. Managers may create a Barber with name and phone before an app account exists.
> Auth entities (Client, Barber, Branch, Admin) are detailed in `12_identity-auth-onboarding.md`.

**Language**
- identifier (e.g., `ar`, `en`)
- name, text_direction (right‑to‑left / left‑to‑right)
- whether it's the default
> The app ships **Arabic + English**; translatable fields resolve against this.

**Currency**
- identifier (e.g., `SYP`, `USD`)
- name (translatable), symbol
- whether it's a platform default

**Exchange Rate**
- **link**: from‑Currency
- **link**: to‑Currency
- **rate** (the conversion factor)
- effective timestamp (so the latest rate is used)

---
