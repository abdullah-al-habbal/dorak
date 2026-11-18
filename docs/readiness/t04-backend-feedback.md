---
nodeid: docs.readiness.t04
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/
---

# T4. Backend feedback system

Status: todo · Phase 3 · Depends on: none · New module: `Feedback` (follow `backend/AGENTS.md` module layout)

One table, no polymorphism. Source context is kept apart from the related business entity.

- [ ] T4.1 Migration, model, enums, factory for `feedback_reports`:
  `kind` (suggestion, bug, support), `status` (new, triaged, in_progress, resolved, closed, spam), `message`, `contact_email`,
  source: `app` (client, business, stylist, dashboard, web), `platform` (android, ios, web), `app_version`, `locale`, `screen`, `workflow`,
  user: `user_type`, `user_id` (nullable), related: `related_type` (enum), `related_id` (nullable), `admin_note`.
- [ ] T4.2 `POST /feedback`, auth optional; FormRequest with allow-lists and length limits; `throttle:5,1`, honeypot field, per-IP daily cap.
- [ ] T4.3 Admin list (filters), show, status and note update under the admin middleware; log status changes via `Audit`.
- [ ] T4.4 Policy, error codes and EN and AR messages per Core conventions.

Tests: 401, 403, 422, 429; guest vs authenticated attribution; status transitions; resource escapes output.
Acceptance: apps and web can submit; admins can triage; spam controls verified.
