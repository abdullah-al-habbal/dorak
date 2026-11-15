# Layer rules

- Keep the file-kind suffixes (`.type.ts`, `.util.ts`, `.zod.ts`, `.enum.ts`, `-keys.ts`). Subfolders add the domain, not a new kind.
- Tests mirror `src/`: `src/lib/query-keys/bookings/booking-keys.ts` -> `tests/lib/query-keys/bookings/booking-keys.test.ts`.
- `import.meta.glob` patterns (see `tests/lib/query-keys-all.test.ts`) are not imports; update them by hand.
- Batch order (payoff over risk): lib keys, types+interfaces, hooks, lib utils, schemas, services query/mutation, domain-only enums/config.
- Leave alone: components (already domain folders), locales, app.
