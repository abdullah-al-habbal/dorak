---
name: llm-council
description: "Feasibility gate for medium and complex Dorak tasks: five independent advisors analyse a planned feature or significant change, peer-review each other anonymously, and a chairman issues PROCEED or HALT. Any upheld rejection halts the task with its reasons. Used by monorepo-task-executor (Step 3a) and directly on 'council this', 'run the council', 'pressure-test this plan', 'is this feasible'. Not for simple tasks, factual questions or yes/no lookups."
---

# LLM Council (feasibility gate)

Stops a developer from starting work that cannot be built, makes no sense to build, or cannot be
built inside the task's scope. Five advisors with deliberately conflicting lenses judge the plan
independently, review each other without knowing who wrote what, and a chairman applies a fixed
gate rule. The work proceeds only when the council agrees it is sound.

The method follows Andrej Karpathy's [LLM Council](https://github.com/karpathy/llm-council)
(independent answers, anonymous peer review, chairman synthesis) and the five thinking styles of
the [LLM Council skill](https://github.com/aiwithremy/claude-skills-llm-council) by Ole Lehmann.
This file is an independent Dorak implementation; it adds the evidence-backed vote and the
PROCEED/HALT rule.

## 1. Triage: does this task need the council?

Classify the task after the executor's audit (Step 2) and slice definition (Step 3).

| Class | Signals (any one is enough for the higher class) | Council |
| --- | --- | --- |
| Simple | One subsystem, no API contract or schema change, no new module, primitive or dependency, no open decision, a few files, behaviour already specified (typo, copy, small bug fix with a clear cause, test-only change, doc fix) | Skip. Record `Council: skipped (simple): <reason>` |
| Medium | A new feature or endpoint, a behaviour change users can see, a new shared primitive, a migration, two or more subsystems, or a refactor across many files | Run |
| Complex | An API contract change used by mobile, a cross-cutting refactor, auth, money or tenant-scope logic, a new external integration, or an unresolved decision in `docs/decisions-required.md` | Run |

When unsure between simple and medium, run it. State the class and the deciding signal in the
report.

## 2. The dossier

The parent writes one neutral dossier that every advisor receives. No opinion, no steering.

1. **The request**, quoted in full.
2. **The planned slice**: affected layers, entry points, files to change, out-of-scope items.
3. **Evidence from the audit**: the current behaviour, the contracts involved (routes, resources,
   Zod schemas, mobile models), relevant decisions and ADRs, and the primitives that apply.
4. **Constraints**: the subsystem guides' rules, the backward-compatibility policy for mobile, and
   the gates the task must pass.
5. **What is at stake**: who uses the behaviour and what breaks if it is wrong.

If the request is too vague to build a dossier, ask the user one clarifying question first.

## 3. Round 1: five advisors, in parallel

Spawn all five at once, read-only (`subagent_type: Explore` or an equivalent read-only agent). They
may read repository files to check claims; they never edit anything.

| Advisor | Lens for this gate |
| --- | --- |
| **The Contrarian** | Assumes the plan has a fatal flaw and hunts for it: regressions, hidden coupling, broken contracts, race conditions, data loss, a missing backend capability. |
| **The First Principles Thinker** | Asks what problem is really being solved. Checks the request against product docs, decisions and ADRs; flags a plan that solves the wrong problem or contradicts a recorded decision. |
| **The Expansionist** | Looks at the full blast radius and upside: every caller, other apps and modules affected, reuse of existing primitives, what the change enables or makes harder later. |
| **The Outsider** | Reads only the dossier with no project history. Flags a request that is ambiguous, internally inconsistent, or that two developers would implement differently. |
| **The Executor** | Asks whether it can be built here, now: does the backend support it, do the contracts exist, can every gate pass, what is the first concrete step, is the scope one slice. |

**Advisor prompt** (fill the brackets):

```
You are [advisor] on the Dorak feasibility council.
Your lens: [lens from the table].

The task under review:
---
[dossier]
---

Analyse it strictly from your lens. Be direct and specific, 150-300 words, no preamble. You may
read repository files to verify claims; do not edit anything.

End with this block exactly:
VOTE: APPROVE | APPROVE_WITH_CONDITIONS | REJECT
CATEGORY: <REJECT only: unimplementable | contradicts-decision | illogical | out-of-scope | unsafe>
EVIDENCE: <REJECT and conditions: file paths, contract names, decision ids; "none" if none>
REASON: <one or two sentences>
CONDITIONS: <APPROVE_WITH_CONDITIONS only: what the plan must add or change>

Vote REJECT only for a blocking reason in one of the categories, backed by evidence you checked.
A concern, a risk you can mitigate, or a preference is a condition, not a rejection.
```

Rejection categories:

- **unimplementable**: a required capability does not exist and the task cannot add it (for
  example the backend has no data for it and the request forbids backend changes).
- **contradicts-decision**: conflicts with a resolved decision, an ADR or a subsystem rule.
- **illogical**: the requested behaviour defeats its own goal or conflicts with itself.
- **out-of-scope**: cannot be done as one slice without bundling unrelated work.
- **unsafe**: breaks the mobile contract, loses data, or weakens authorization or tenant scope
  with no safe path.

## 4. Round 2: anonymous peer review, in parallel

Shuffle the five responses into Response A to E so position reveals nothing. Spawn five fresh
read-only reviewers. Each sees the dossier and all five anonymised responses and answers:

1. Which response is strongest, and why?
2. Which response has the biggest blind spot, and what is it?
3. What did all five miss?
4. For each REJECT: is the cited evidence real and does it actually block the task? Check the
   cited files. Answer `UPHELD` or `UNSUPPORTED` with one line of reasoning.

Keep each review under 250 words.

## 5. Round 3: chairman and the gate

One fresh agent receives the dossier, the five de-anonymised responses and the five reviews, and
writes the verdict. The gate decision follows these fixed rules; the chairman explains it but
cannot overrule it.

- A REJECT is **upheld** when at least three of the five reviewers mark it `UPHELD`. An
  unsupported REJECT becomes a condition and is listed as such.
- **PROCEED** when no REJECT is upheld. Every condition becomes an acceptance criterion of the
  task and is listed in the plan.
- **HALT** when any REJECT is upheld. Consensus is required to proceed, so one upheld rejection is
  enough.

Verdict format:

```
## Council verdict: <short topic> — PROCEED | HALT

### Votes
| Advisor | Vote | Category | Reason |

### Where the council agrees
### Where the council clashes
### Blind spots caught in review
### Conditions carried into the task
### Recommendation and first step
```

## 6. Acting on the verdict

- **PROCEED**: continue the executor workflow at Step 4 with the conditions added to the plan.
- **HALT**: stop before any file change. Show the user this alert, then end the turn:

```
⛔ COUNCIL HALT — <task>
The task was not started. Rejected by:
- <advisor> (<category>): <reason>. Evidence: <files/decisions>.
To unblock: <what must change: a revised request, a resolved decision, a backend capability, a split scope>.
```

  Do not edit, stage or commit anything for the task. The user may revise the request, resolve the
  decision in `docs/decisions-required.md`, or explicitly override ("proceed despite the
  council"). An override is recorded in the final report and in the commit body.

## Rules

- Advisors and reviewers are fresh, read-only agents. The parent never writes an advisor's answer
  or a review itself, and never edits the votes.
- Spawn each round in parallel. Do not show one advisor another's answer before Round 2.
- Do not save transcripts in the repository. The verdict goes into the chat and the final report.
- The council judges feasibility and soundness, not code style. Style belongs to the gates.
- A council run costs eleven agents. Run it once per task, before implementation; re-run only if
  the plan changes materially after a HALT is resolved.
