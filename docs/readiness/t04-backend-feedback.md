---
nodeid: docs.readiness.t04
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/
---

# T4. Backend feedback system

Status: done · Phase 3 · Depends on: none · New module: `Feedback` (follow `backend/AGENTS.md` module layout)

One table, no polymorphism. Source context is kept apart from the related business entity.

- [x] T4.1 Migration, model, enums, factory for `feedback_reports`:
  `kind` (suggestion, bug, support), `status` (new, triaged, in_progress, resolved, closed, spam), `message`, `contact_email`,
  source: `app` (client, business, stylist, dashboard, web), `platform` (android, ios, web), `app_version`, `locale`, `screen`, `workflow`,
  user: `user_type`, `user_id` (nullable), related: `related_type` (enum), `related_id` (nullable), `admin_note`.
- [x] T4.2 `POST /feedback`, auth optional; FormRequest with allow-lists and length limits; `throttle:5,1`, honeypot field, per-IP daily cap.
- [x] T4.3 Admin list (filters), show, status and note update under the admin middleware; log status changes via `Audit`.
- [x] T4.4 Policy, error codes and EN and AR messages per Core conventions.

Tests: 401, 403, 422, 429; guest vs authenticated attribution; status transitions; resource escapes output.
Acceptance: apps and web can submit; admins can triage; spam controls verified.

## Implementation notes

- `screen` and `workflow` are validated by a key pattern (lowercase letters, digits, `_ . / -`, 64 characters) instead of a closed list, so apps can add screens without a backend release; the dashboard can still filter by them later.
- The sender's identity (`user_type`, `user_id`) is read from the bearer token only. `related_id` is stored as given (a plain string); it is not checked against the related table, so a report about a deleted record stays readable.
- Spam: 5 per minute and 30 per day per IP, a honeypot field named `website`, and a required email for guests. No captcha (a new dependency and a privacy cost) until abuse is seen.
- Tests: `tests/Feature/Feedback/FeedbackApiTest.php` (28 tests); Architecture, Contract, route-coverage and Audit suites pass.
