---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# Async State

Status: `DONE`

How a bloc represents the lifecycle of an asynchronous operation. Rules live in
[`conventions.md`](./conventions.md) §4–§5; this page is the matrix and the
worked examples.

---

## The five conditions

Every async surface distinguishes five conditions. They are **fields on one flat
state class**, never a sealed subclass hierarchy.

| Condition | Expressed as | Never |
|---|---|---|
| Initial | the `const` default constructor | conflated with loading or empty |
| Loading | `isLoading` (read) / `isSubmitting` (write) | both at once for one operation |
| Success | `error == null` and data present | a separate `isSuccess` flag |
| Empty | `success && data.isEmpty` | rendered as an error |
| Error | `error != null` | rethrown out of the bloc |

**Initial is not loading.** A bloc that has never been asked to do anything is
not busy. `SessionState.status == AuthStatus.unknown` is the reference: the
router holds on `/splash` for `unknown`, which is a different decision from
"a request is in flight".

**Empty is not an error.** A successful request that returned nothing is a
product state with its own copy and often its own call to action. Collapsing it
into the error branch is the most common way this goes wrong — and it is exactly
what `ApiClient.getPaginated` used to cause by returning an empty page for a
failed envelope.

## `isLoading` versus `isSubmitting`

| | Meaning | Example |
|---|---|---|
| `isLoading` | reading — the screen is populating itself | `SessionState.isLoading` during restore; `OnboardingConfigState.isLoading` |
| `isSubmitting` | a user-initiated write is in flight | `AuthState.isSubmitting` during login, register, verify, resend |

The distinction is not cosmetic: `isSubmitting` disables the form and shows an
in-button spinner, `isLoading` shows a skeleton or placeholder. A bloc that does
both operations names them separately.

## Continued in

- [Part 2: The _run idiom](async-state-part-2.md)
- [Part 3: Retry](async-state-part-3.md)
