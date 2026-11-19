---
nodeid: docs.product-research.dorak
parentnode: docs.product-research
childnodes:
  - docs.product-research.dorak.study-prompt
codeanchors:
  - docs/product-research/
---

# Dorak: product study

Routes: [product research](../index.md) · [documentation graph](../../index.md) · [README](../../../README.md)

This folder holds the study of Dorak itself, written to the same feature-matrix contract as the competitor studies so that a later comparison can be made row by row. The study is independent: it is produced before any comparison and must not read any competitor study.

## Status

The study has not been run. Only its harness exists.

| Item | State |
|---|---|
| [Study prompt](study-prompt.md) | Prepared. It defines the scope, the evidence rules, the feature-matrix contract and the output rules for a future explicit run. |
| `docs/product-research/dorak/dorak-study.md` | Future output, not created |
| `docs/product-research/dorak/dorak-feature-matrix.csv` | Future output, not created |

The two output files are the only paths a run may write, and a run must not overwrite them without approval.
