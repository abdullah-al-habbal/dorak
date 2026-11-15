# API response standard and the ban on hand-built JSON

Every API body, success or error, comes from `Modules\Core\Helpers\ApiResponseTrait` and has the same keys:
`success`, `statusCode`, `code`, `message`, `timestamp` (ISO 8601 with milliseconds and `Z`), plus `data`, `meta` and `errors` when present. The global handler (`ApiExceptionResponseHandler`) adds `request_id`.

## The rule
**No code outside the trait and the global exception handler may call `response()->json(`.** `tests/Feature/Architecture/ApiResponseArchitectureTest.php` scans `modules`, `app`, `bootstrap` and `routes` (comments and strings ignored) and fails on any other file. It also fails when a module exception declares its own `render()`.

## Building blocks
| Piece | Use |
|---|---|
| `ApiResponseTrait` (`success`, `created`, `error`, `forbidden` and friends) | Actions (via `BaseApiAction`), middleware and static helpers `use` it and return `$this->error(...)`. |
| `ErrorCodeEnum` | Generic codes with status and translation key. Account and session codes added for the middleware: `ACCOUNT_NOT_ACTIVE` (403), `ACCOUNT_BANNED` (403), `TOKEN_ABILITY_MISSING` (403). |
| `Modules\Core\Exceptions\ApiErrorException` | Abstract base of domain exceptions. A subclass implements `errorCode()` and `httpStatus()` (and may override `errorDetails()` for `errors`). `render()` is inherited. |
| `ConflictApiException` | Base for 409 state-machine conflicts: `AdminUserGuardException`, `BranchLifecycleException`, `BrandReviewException`, `AccountBanException`, `BarberActivationException`, `BarberReviewException`. |
| `ForbiddenApiException` | Base for 403 lifecycle or feature refusals: `BrandSuspendedException`, `BrandNotApprovedException`, `BranchReadOnlyException`, `BranchNotOperationalException`, `FeatureNotEnabledException`. |
| `AccountBannedResponse::make()` | Static helper for the ban middleware and the dashboard session check; builds `ACCOUNT_BANNED` through the trait. |

## Stable domain codes
Domain exceptions keep their lower-case snake codes (`brand_suspended`, `branch_read_only`, `branch_not_operational`, `feature_not_enabled`, `admin_last_active`, ...). Clients switch on them, so they are part of the contract and are not renamed or moved into `ErrorCodeEnum`. Only the generic upper-case codes live in the enum.

## Adding a new domain error
1. Extend `ConflictApiException` or `ForbiddenApiException` (or `ApiErrorException` for another status).
2. Return the stable code from `errorCode()`; put the translated text in the module's lang files.
3. Do not write `render()` and never call `response()->json(`.

## Contract note (2026-11-15)
The migrated middleware and exceptions previously stamped `timestamp` with `toIso8601String()` (`...+00:00`); they now use the trait's `toISOString()` (`...123456Z`) like every other response. Keys, status codes and `code` values are unchanged. The Next.js dashboard types `timestamp` as a string and the Flutter apps do not parse it; they read `statusCode`, `code` and `message` only.
