# 11 — Resolution Status

Re-audited against the code on 2026-11-18. Every finding in this review is closed. Playwright was not run for these changes (owner's instruction); the gates were lint, typecheck, Vitest and a `next build` that compiles and typechecks (the command exits 1 on Next's security-advisory check, as it does on earlier commits).

| ID | Result | Evidence |
|---|---|---|
| F-01 | Closed | Every multi-field dialog uses RHF + Zod + `mapApiFormError`. The last three (`invite-barber-dialog`, `rate-client-dialog`, `special-days-section`) were migrated last. The single-field reason dialogs stay on `useState`, as the review recommended. |
| F-02 | Closed | `AuthStoreProvider` seeds the store before the first render. |
| F-03 | Closed | `overlay-host.tsx` loads every dialog with `next/dynamic`. A build gives 105 chunks, 101 under 60 KB. |
| F-04 | Closed by measurement | The dictionary is about 94 KB raw (24 KB gzipped) in English and 88 KB (29 KB gzipped) in Arabic, sent once per full document load. The shared first-load base is about 167 KB gzipped, so splitting by route would save little for a large risk: a client component that reads a namespace the route did not send would crash. Left as designed. Revisit if the dictionary grows several times larger. |
| F-05 | Closed | `parseEnumValue`; no `Set<string>` narrowing or `.value as Enum` casts remain. |
| F-06 | Closed | `toLocalePair`. |
| F-07 | Closed | `BookingToolbar` reuses `SearchInput`. |
| F-08 | Closed | `logContractDrift` (dev only). |
| F-09 | Closed | ESLint `no-restricted-imports` and `explicit-module-boundary-types`. |
| F-10 | Closed | The 7 listed exports are gone. A fuller scan then removed 4 unused type files and the `export` of 23 values used only inside their own file. 25 exported types remain because they appear in their own file's signatures. |
| F-11 | Closed | Component tests for the three migrated dialogs and the dialog close label; hook tests for `useLeaveWarning`, `useMediaQuery`, `useUrlFilters` and `useListQuery` in `tests/hooks/`; schema and util tests for every migrated form. |
| F-12 | Closed | Dictionary keys for the nav label and sections. The dialog and sheet close buttons and the breadcrumb label (found in this pass) now use the dictionary too. |
| F-13 | Closed | `AGENTS.md` reworded. |

## Items the review listed as not verified

| Item | Result |
|---|---|
| Circular dependencies | None. A script over the value-import graph (type-only imports skipped) found 0 cycles in 1,300+ files. |
| Bundle size | Measured above. |
| Unused exports | Scanned across `src/` and `tests/`; see F-10. |
| `cn` and `shadcn` dependencies | `cn` is imported by `components/ui`. `shadcn` is needed at build time: `globals.css` imports `shadcn/tailwind.css`. Both stay in `dependencies`. |
| EN/AR parity | Key parity was already tested. A placeholder check was added: Arabic never uses a `{placeholder}` that English lacks (it may drop one, for example the plural unit in `earnings.chart.summary`). |
| `app/api/**` and `services/api/auth|proxy` | Audited. Two defects fixed, both with regression tests: (1) `verifyClaim` looked up the signing key with the cookie's `kid` on a plain object, so `kid: "constructor"` signed with `String(Object)` produced a claim the dashboard accepted; the lookup now uses own keys only. (2) The allow-list `ID` pattern matched `.` and `..`, which `fetch` normalises (`bookings/../review` would reach `/review`); dot segments are now refused. A declared-size pre-check also refuses an oversized JSON body before it is buffered, as uploads already did. The backend still authorises every request. |
| Per-component accessibility | Static scan: no `<img>` without `alt`, no icon-only button without a name. The three leaks above were found and fixed. A screen-reader pass is not covered. |
