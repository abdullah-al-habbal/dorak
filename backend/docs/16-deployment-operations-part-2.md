---
nodeid: backend.16-deployment-operations.part-2
parentnode: backend.16-deployment-operations
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 11 · [16 — Deployment Operations & Known Limitations](16-deployment-operations.md) · [Previous](16-deployment-operations.md) · [Next](16-deployment-operations-part-3.md)

**Fix:** `config:cache` and `view:cache` moved after the swap; `route:cache`
stays before it (path-independent, release-local `bootstrap/cache`).

---

## TODO 44 — Composer security advisories (separate task)

Eight pre-existing advisories, **not addressed** by the deployment repair:

| Package | Version | Advisories |
|---|---|---|
| `guzzlehttp/guzzle` | 7.15.1 | 2 (one **high** — CVE-2026-69246, noncanonical host bypasses host-based checks; CVE-2026-69245, noncanonical cookie domain keeps subdomain scope) |
| `league/commonmark` | 2.8.3 | 6 (three **high** — DoS via colliding heading slugs, duplicate footnote definitions, deeply nested XML output) |

**Verified unchanged by this work.** `composer.lock` diff is a single line (the
`content-hash`); a package-by-package comparison against `HEAD` shows
**181 packages both sides, 0 version changes**. Both packages are transitive.

Not silently ignored. Owner action: schedule a dependency-update task.

---

## TODO 45 — Pre-existing issues, deliberately untouched

| Issue | Detail |
|---|---|
| Larastan `level: max` errors | **15**, identical count before and after `8a07a89`. Files: `ClientFaceProfile/Services/{FaceAnalysisService,FaceAnalysisResponseParser}`, `Marketing/…/GetMarketingPageRequest`, `Client/Jobs/SendEmailVerificationCodeJob`, `Client/Handlers/Client/{VerifyEmailHandler,RegisterHandler}` |
| Stale PHPStan baseline | `phpstan-baseline.neon` ignores a `GetMarketingPageRequest::getLocale()` error that no longer occurs. `ignore.unmatched` is non-ignorable, so a *fixed* bug now fails the gate |
| `.env.testing` mail config | still carries an empty `MAIL_URL=`. Inert today (`MAIL_MAILER=log`), but an empty `MAIL_URL` passes `isset()` and nulls the transport |
| Development-only OTP logging | `ForgotPasswordHandler` + `SendEmailVerificationHandler` log the generated OTP, gated on `app()->environment('local')`. Committed in `8a07a89`. **Must be stripped before anything merges toward staging** |
| `modules/Core/Enums/Universe.php` | one added blank line, unrelated to any task, left as found |
| `APP_URL` is mandatory | `modules/Core/Config/filesystems.php:20` evaluates `rtrim(env('APP_URL'), '/')` with **no default**. Any environment missing `APP_URL` dies with `TypeError: rtrim(): Argument #1 ($string) must be of type string, null given`. This is why CI must use `composer install --no-scripts` |

---
