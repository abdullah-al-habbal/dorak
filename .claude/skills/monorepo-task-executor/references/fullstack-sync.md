# Full-stack sync matrix

Walk every row for every task. Change the layer, or write down why it needs no change. Zero stale state, unmapped statuses or codes, missing translations, or half-wired UI.

| Layer | Check |
| --- | --- |
| Backend | Actions, requests, handlers, resolvers/services, models, policies, events, jobs, enums, lang files (en + ar), migrations, other routes reaching the same rule |
| API contract | Payload fields, validation rules, status codes, error `code` strings, `errors`/`meta` shape, auth guard, idempotency |
| Docs | Task spec (decision, implemented contract, ticked criteria), `docs/decisions-required.md`, `docs/todowork.md`, `backend/docs/feature-index.md`, specs of dependent tasks the work overtakes |
| Dashboard | Zod schemas, payload mappers, forms/components, BFF pass-through, en + ar dictionaries, Vitest |
| Mobile | `core` repositories/DTOs/exceptions, blocs/state, screens, `localization` ARBs + regenerated output, all three apps (`client_app`, `business_app`, `stylist_app`) and shared packages, tests |
| Tests | Backend Pest (allowed, rejected, side effects), Dashboard Vitest/lint/typecheck/build, Mobile `melos verify` |

A client the spec says "needs no change" must still be verified, not assumed.

## Contract ripple
If an API response or error shape changes, these change in the same task:
- dashboard BFF mapping (`ApiClientError.errors` is `Record<string, string[]>`, so structured error data must fit that type) and the form that consumes it;
- the Dart parser/exception in `packages/core` (`api.client.dart` `_exceptionFrom`) and the bloc/screen that reacts;
- the docs listed above.
