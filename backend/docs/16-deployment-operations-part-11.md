---
nodeid: backend.16-deployment-operations.part-11
parentnode: backend.16-deployment-operations
childnodes: []
codeanchors:
  - backend/modules/
---

Part 11 of 11 · [16 — Deployment Operations & Known Limitations](16-deployment-operations.md) · [Previous](16-deployment-operations-part-10.md)

### Evidence

Local reproduction:

```text
view:clear                     ->   0 files
view:cache (run 1)             -> 317 files
plant a stale compiled file    -> 318 files
view:cache (run 2)             -> 317 files
identical filename set across runs : YES
planted stale file survived        : NO — removed
net growth over 2 runs + 1 stale   : 0
```

317 compiled files come from 13 first-party Blade templates plus vendor package
views (framework packages and friends). That number is a property of the dependency tree,
not of deployment count.

### Answers to the questions asked

| Question | Answer |
|---|---|
| Filenames deterministic for a given source path? | Yes — `xxh128` of the path |
| Does `view:cache` remove old files? | **Yes** — it calls `view:clear` first |
| Referenced by path from runtime state? | No. Resolved by hashing the source path at render time |
| Does Laravel ever need an older release's compiled files? | No. A miss triggers lazy recompilation |
| Are stale files harmless? | Yes, and moot — `view:cache` removes them |
| Safe for concurrent requests? | Yes. A request that misses compiles the view on the fly |
| Is age-based pruning reliable? | Irrelevant, and would be unsafe — all files share one mtime |
| Is release-ownership pruning possible? | No, and unnecessary — paths are release-independent |
| Should cleanup run after a successful deploy? | No cleanup should run at all |

### Consequence for the deployment

`deploy.yml` runs `view:cache` **after** the swap and does not call `view:clear`
separately — but `view:cache` clears internally regardless, so the shared
directory is briefly emptied and immediately rebuilt.

That is safe **because it happens after the swap**, when the new release is
already live: the gap between clear and recompile is covered by Blade's lazy
compile on a cache miss. It would **not** be safe before the swap, when the
previous release is still serving out of the same shared directory — which is
why `optimize:clear` (which also runs `view:clear`) stays out of the pre-swap
phase.

The rollback target `${TARGET}_old` does not need its compiled views preserved;
after a rollback they are recompiled lazily on first request.

**Nothing to implement.** Adding a pruning mechanism here would be automation
for a problem that does not exist, and every candidate design (age-based,
release-ownership) is either unreliable or actively unsafe.
