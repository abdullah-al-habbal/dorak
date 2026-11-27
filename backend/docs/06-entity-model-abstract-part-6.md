---
codeanchors:
  - backend/modules/
---

Part 6 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract-part-5.md) · [Next](06-entity-model-abstract-part-7.md)

## 3. Abstract relationship view

> Relationships only (no attributes) — the *shape* of the model. Dashed links marked **(poly)** are **polymorphic**: one end can point at more than one kind of entity (explained in §4).

```mermaid
erDiagram
    CLIENT ||--o| BRAND : "owns"
    CLIENT ||--o| BARBER : "is (optional)"
    CLIENT ||--o{ NOTIFICATION : "receives"

    BRAND ||--|{ BRANCH : "has (>= 1)"
    BRANCH ||--o{ CHAIR : "has"
    CHAIR }o--o| BARBER : "assigned (nullable)"

    BARBER ||--o{ BARBER_AFFILIATION : "has"
    BRAND ||..o{ BARBER_AFFILIATION : "affiliable (poly)"
    BRANCH ||..o{ BARBER_AFFILIATION : "affiliable (poly)"

    BRAND ||..o{ SERVICE : "offers / serviceable (poly)"
    BARBER ||..o{ SERVICE : "offers / serviceable (poly)"
    CURRENCY ||--o{ SERVICE : "prices"
    BRAND }o--|| CURRENCY : "base currency"
    EXCHANGE_RATE }o--|| CURRENCY : "from"
    EXCHANGE_RATE }o--|| CURRENCY : "to"

    CLIENT ||--o{ BOOKING : "makes"
    BOOKING }o--o| CHAIR : "for (nullable: at-home)"
    BOOKING }o--o| BARBER : "for (optional)"
    BOOKING }o--o{ SERVICE : "includes"

    BOOKING ||--o{ REVIEW : "yields (two-way)"

    BRANCH ||--o{ JOB : "posts"
    JOB ||--o{ JOB_APPLICATION : "receives"
    BARBER ||--o{ JOB_APPLICATION : "submits"

    BRAND ||..o| SETTINGS : "settingable (poly)"
    BRANCH ||..o| SETTINGS : "settingable (poly)"
    BARBER ||..o| SETTINGS : "settingable (poly)"
    CLIENT ||..o| SETTINGS : "settingable (poly)"

    LANGUAGE ||..o{ BRAND : "labels (translatable)"
```

> If your Markdown viewer doesn't render Mermaid, read the diagram as the relationship list spelled out in §4 and in `04-house-rules.md`.

---
