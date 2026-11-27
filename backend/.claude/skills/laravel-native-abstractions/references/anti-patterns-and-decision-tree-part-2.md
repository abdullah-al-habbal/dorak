---
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [anti patterns and decision tree](anti-patterns-and-decision-tree.md) · [Previous](anti-patterns-and-decision-tree.md)

## Decision tree

```text
Does Laravel already model this concept?
│
├─ Yes
│  ├─ Is there a dedicated semantic method/attribute?
│  │    └─ Use it.
│  ├─ Is there only a broader builder/facade API?
│  │    └─ Use the broader API rather than custom infrastructure.
│  └─ Is the behaviour reusable domain logic?
│       └─ Encode it in the model / policy / rule / Handler layer.
│
└─ No
   ├─ Is this a database-engine-specific requirement?
   │    └─ Use Query Builder / raw SQL deliberately, with a comment.
   ├─ Is this genuine domain behaviour?
   │    └─ Implement it in the module (Action → Handler → Resolver).
   └─ Is this infrastructure?
        └─ First check whether a Laravel contract or installed package already covers it.
```
