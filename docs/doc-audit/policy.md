---
nodeid: docs.doc-audit.policy
parentnode: docs.graph
childnodes:
  - docs.doc-audit.ledger
  - docs.doc-audit.pilot
codeanchors:
  - docs/
---

# Documentation policy

The rules for the documentation audit. Progress and verdicts are in the [ledger](ledger.md).
Approved by the owner on 2026-11-27. This folder is temporary: when the audit ends, the lasting rules move into
`AGENTS.md` and `docs/doc-audit/` is deleted.

## 1. Authority

- Code, tests, migrations and configuration decide **what the system does**.
- Owner decisions, ADRs and product rules decide **what it should do**. If code disagrees with one of them, log it
  for the owner. It may be a code bug, so don't rewrite the rule to match the code.
- What the repository can't prove (hosting, stores, third parties) is marked unverified, with a date.

## 2. Document classes

| Class | Holds | Rule |
|---|---|---|
| Rules | agent and engineering instructions | one source per scope |
| Router | maps and links to other documents | no facts of its own |
| Reference | how the system works now: architecture, contracts | present tense; no status or history; don't restate what code shows plainly |
| Decisions | why: ADRs, product rules | dated; superseded, not silently edited |
| Open work | what is left and in what order | open items only; remove when verified |
| Operations | runbooks and current deployment state | current state only; history stays in Git |
| Intent | product plans and unbuilt features | says clearly what isn't implemented |
| Research | market, competitor and product studies | dated; labelled as not requirements |
| Temporary | audits, handovers, task reports, finished plans | keep what is still true or open, then delete |

## 3. Writing rules

1. **One topic per file**, and one home for each fact. Others link to it.
2. This replaces the 70-line split (commit `f50ddc011`). Merge part files where it helps; length alone is no
   reason to split.
3. Obsolete files are deleted, not archived. Git keeps the history.
4. No new document by default. First update the file that already owns the topic.
5. No solved-problem narratives, task logs or test-run results in lasting documents. Commits hold those.

## 4. Review method

Review a cluster of related documents together. Treat a hub and its parts as one logical document.
Each one gets one verdict:

| Verdict | Meaning |
|---|---|
| `keep` | checked; accurate and useful |
| `fix` | stays; some claims or links are wrong |
| `merge` | unique content moves to another file |
| `extract then delete` | the part that is still true or open moves first |
| `delete` | nothing left to keep |
| `unreviewed` | not checked yet; says nothing about accuracy |

| A claim that is | Action |
|---|---|
| true | keep only if it adds something the code doesn't show |
| false and descriptive | fix or delete |
| in conflict with a rule or decision | log for the owner |
| about unfinished work | move only the remaining part to the backlog |
| about a solved problem | delete; keep any lasting reason |
| not verifiable from the repository | mark unverified, with a date |

**Evidence.** Every verdict other than `unreviewed` cites a file and line, a commit or a command. A working link or
code anchor isn't evidence that the text is true.

**Before deleting or moving:** check references in Markdown and in other tracked files (scripts, workflows, tests,
source comments, CSV). In the same commit, update links, `nodeid`, `parentnode`, `childnodes` and router entries.

**Per cluster:** check the [session board](../sessions/index.md) and live sessions, read, verify, propose verdicts,
wait for the owner's approval, apply, check links, make one local commit. No push without the owner's request.

## 5. One shared guide: `AGENTS.md`

Approved direction: `AGENTS.md` is the shared source and `CLAUDE.md` refers to it, **after** confirming that no
instruction is lost. Checked on 2026-11-27: **the condition isn't met yet.** No guide has been changed.

**How the pointer must work.** Use an `@AGENTS.md` import line, as `frontend/web/dashboard/CLAUDE.md` already does.
My understanding is that Claude Code loads `CLAUDE.md` automatically and expands `@` imports, while a plain Markdown
link loads nothing. Confirm this with a fresh session when the first pointer is applied.

**Root pair.** Move these into `AGENTS.md` first. They are in `CLAUDE.md` or its part 2 but not, or not fully, in
`AGENTS.md`:

| Content | Note |
|---|---|
| Subsystem governance paragraph (authorization, type safety, size limits, literals, UI performance) | missing |
| Stage only the files the task touches; never use `--no-verify` | missing |
| Commit locally with a conventional type and task number | missing |
| Don't alter remote tracking | `AGENTS.md` covers push and remote changes only |
| Task executor: audit, vertical slice, gates, done only on evidence | `AGENTS.md` only names the skill |

Keep what only `AGENTS.md` has, such as "(the only dashboard)". The push rule follows DA-1 (section 7).

**Nested pairs.** A line comparison ignoring headings, short lines and spacing gives these counts. It counts
rewording as different, so they show review effort, not the number of unique rules.

| Scope | Compared `CLAUDE.md` lines not found verbatim in `AGENTS.md` |
|---|---|
| `backend` | 44 of 44 |
| `frontend/web/dashboard` | none left to compare; already an import |
| `frontend/mobile` | 42 of 42 |
| `apps/business_app` | 39 of 39 |
| `apps/client_app` | 56 of 56 |
| `apps/stylist_app` | 40 of 41 |
| `packages/core` | 55 of 55 |
| `packages/design_system` | 51 of 51 |
| `packages/localization` | 32 of 32 |
| `packages/feature_error_feedback` | 10 of 10 |

`apps/` and `packages/` are under `frontend/mobile/`. The backend `CLAUDE.md`, which I read in full, has rules of its
own. Each nested pair needs a rule-by-rule merge before its `CLAUDE.md` becomes an import.

## 6. Phases

| Phase | Work | State |
|---|---|---|
| 0 | inventory: this policy and the ledger | done |
| 1 | agree the rules | done |
| 2 | pilot: the push-notification cluster (C0) | [proposed](pilot.md), awaiting approval |
| 3 | clusters C1 to C6, in order | not started |
| 4 | prevent regrowth: rules in the root guide and task executor; CI check for links, anchors and routers | not started |

The `.claude/` files get a separate, later audit. Third-party skills shouldn't be rewritten.
[Wave 6](../waves/wave-6.md) task W6.4 (refresh stale docs) overlaps this audit; link them in C2.

## 7. Audit decisions

Approved by the owner on 2026-11-27.

| ID | Decision |
|---|---|
| DA-1 | Push rule for the shared guide: push only when the owner asks, or at a wave close under the backlog's Delivery decision. During this audit, push only when the owner explicitly asks. Applied to the guides in C1. |
| DA-2 | Keep the graph frontmatter and `docs/graph` routers for now; re-evaluate after the pilot. |
| DA-3 | Audit backlog and wave files only after checking the session board for active writers. |
