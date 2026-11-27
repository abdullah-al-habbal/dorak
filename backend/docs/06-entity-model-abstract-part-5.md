---
codeanchors:
  - backend/modules/
---

Part 5 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract-part-4.md) · [Next](06-entity-model-abstract-part-6.md)

### Trust & talent

**Review** *(two‑way)*
- identifier
- **link**: Booking *(must be completed)*
- **author (polymorphic)**: a Client *or* a Brand/Branch
- **subject (polymorphic)**: the **other** side
- rating + comment (text)
- timestamps
> Same shape used both ways: client→shop and shop→client.

**Job**
- identifier
- **link**: Branch
- title + description (**translatable**)
- **status**: open / closed
- *(paid‑vs‑unpaid is **out** for MVP — `04-house-rules.md` G2)*

**Job Application** *(a lightweight snapshot — not an ATS)*
- identifier
- **link**: Job
- **link**: Barber
- **profile snapshot** (the barber's key details at apply time)
- **status**: submitted / seen
- timestamps

---

### Later 🔭

**Notification** *(minimal for MVP)*
- identifier
- **recipient link**: a Client
- type (invite, application, booking update, …)
- payload, read/unread, timestamps

---
