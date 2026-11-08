---
nodeid: skills.repo.monorepo-task-executor.references.security-review
parentnode: skills.repo.monorepo-task-executor
childnodes: []
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Security review (Cloudflare `security-audit` skill)

Every task ends with a security review of its own diff before the commit (Step 7a). The
methodology comes from the shared [`security-audit`](../../security-audit/SKILL.md) skill, used in
its **guidance mode**: focused, source-only, no audit artifacts, no full six-phase run.

## 1. Decide whether the diff crosses a trust boundary

The review is **required** when the task's diff touches any of these Dorak surfaces:

| Surface | Where | Companion file to load |
| --- | --- | --- |
| Authentication, tokens, sessions, OTP/SMS | backend auth modules, `app/api/auth/**`, `services/api/auth/`, cookie config, mobile token storage | `WEB-PROTOCOL-AND-AUTH.md` |
| Authorization and ownership | `*Policy`, `authorize()`/`Gate`, actions that read or write another actor's resource, guard/actor checks in portal layouts | `ATTACK-CLASSES.md` |
| Brand/branch scope, tenant isolation | scoped queries, `branch_id`/`brand_id` filters, exports, caches keyed by tenant, seeders that cross brands | `DATA-ISOLATION-AND-LIFECYCLE.md` |
| Dashboard proxy and request forwarding | `proxy.ts`, `services/api/proxy/`, the allow-list, `X-Dashboard-Session` signing | `WEB-PROTOCOL-AND-AUTH.md` |
| Rendering server or user strings | any `dangerouslySetInnerHTML`, URL building from input, `postMessage`, redirects | `CLIENT-SIDE.md` |
| Money and state machines | bookings, payouts, subscriptions, commission, settings that change limits | `ATTACK-CLASSES.md`, `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` |
| Uploads, webhooks, queues, broadcasts | file handling, signed URLs, queued jobs, broadcast channels | `PROTOCOLS-RPC-AND-MESSAGING.md` |
| Mobile deep links, webviews, local storage | `frontend/mobile/**` routing, secure storage, intent handling | `DESKTOP-MOBILE-AND-LOCAL-IPC.md` |
| Dependencies, CI, hooks, release | `package.json`, `composer.json`, `pubspec.yaml`, lock files, `.github/`, git hooks | `SUPPLY-CHAIN-AND-RELEASE.md` |
| Deployment and runtime config | `.env*` templates, `config/*.php`, Docker, CORS, rate limits | `CLOUD-AND-DEPLOYMENT.md` |

If none of them is touched (for example a pure refactor with unchanged behaviour), record
`Security review: not applicable` with a one-line reason in the gate table. Do not skip silently.

## 2. Review the diff in guidance mode

1. Read `security-audit/SKILL.md` "Core principles" and only the companion files the table
   selects. Do not run its six-phase workflow and do not create an output directory.
2. Scope: `git diff` of the task's files plus every caller and entry point listed in Step 3 of
   the workflow. For each changed boundary, name the lower-trust principal, the input or action,
   the intended control, and the affected resource.
3. Source only. Do not probe deployed endpoints, shared services or real accounts. The
   repository's own gates (Pest, Vitest, Playwright on the seeded dev database) are the only
   code that runs; the review does not execute anything else.
4. Apply the skill's evidence bar: a finding needs a reachable boundary violation and a concrete
   result. A missing best practice behind a working control is a hardening note, not a finding.

## 3. Act on the result

| Outcome | Action |
| --- | --- |
| Confirmed issue introduced by this task | Fix it in this task with a regression test (allowed and rejected cases), rerun the gates, then commit. |
| Confirmed issue that predates the task | Do not fix it here (one slice per commit). Report it under "Pre-existing findings" with file, boundary and smallest fix. |
| `needs_validation` (fact outside source, such as proxy or provider config) | Report the exact missing fact and a safe owner-side check. No severity. |
| Nothing found | Record the surfaces and companion files reviewed. |

Severity follows the skill's anchors (critical, high, medium, low, informational) and only for
confirmed issues.

## 4. Full audit (explicit request only)

Run the skill's **full audit mode** only when the user explicitly asks for a security audit,
pen-test or comprehensive review of the codebase. It launches many sub-agents, so first confirm
the profile (`quick`, `standard`, `deep`), the scope paths and an agent budget with the user.

- Output goes outside the repository: `~/security-audit-skill/dorak/run-<N>`. Never write audit
  artifacts into the monorepo or commit them.
- Its findings become separate tasks: each confirmed issue is fixed as its own task and commit
  through this executor, never bundled into the audit.
