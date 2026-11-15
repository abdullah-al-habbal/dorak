# Layer rules

- Keep the file-kind suffixes (`.type.ts`, `.util.ts`, `.zod.ts`, `.enum.ts`, `-keys.ts`). Subfolders add the domain, not a new kind.
- Tests mirror `src/`: `src/lib/query-keys/bookings/booking-keys.ts` -> `tests/lib/query-keys/bookings/booking-keys.test.ts`.
- `import.meta.glob` patterns (see `tests/lib/query-keys-all.test.ts`) are not imports; update them by hand.
- Batch order (payoff over risk): lib keys, types+interfaces, hooks, lib utils, schemas, services query/mutation, domain-only enums/config.
- Leave alone: components (already domain folders), locales, app.

## Status (done, one commit each)

lib keys (`map-lib-keys.json`), types + interfaces (`map-types-interfaces.json`), hooks (`map-hooks.json`),
lib utils (`map-lib-utils.json`), schemas (`map-schemas.json`), services query + mutation (`map-services.json`).

Not moved on purpose: `enums/` and `config/` (highest fan-in: `routes`, `auth-actor`, `http-method`; low payoff),
`components/`, `locales/`, `app/`, `services/api/{proxy,core,auth,public}`.

Rule-map shape (plan-moves.mjs, mode B): first matching `rules` regex wins; `core` regexes force `<dir>/core/`;
`ui` forces `<dir>/ui/`; anything unmatched goes to `default`. After planning read the per-domain counts on stderr:
no folder may exceed 30 files. After applying, run `rewrite-docs.mjs` for markdown path mentions.
