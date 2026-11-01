# Batch F: Barber and Client cross-layer enums

Status: [x] Done (single commit)

## Tasks
- [x] Backend: consolidate the client's preferred universe on `Client\Enums\UniverseEnum` (men/women). `ClientModel` casts to it; the `Core\Enums\Universe` enum (with an unreachable `all` case) is deleted, and `ExploreUniverse` and the resolver no longer convert between the two.
- [x] Backend: new `Core\Enums\AccountAccessScope` (`active`, `onboarding`, `approved`, `verification`) replaces string scopes in `EnsureBarberAccountAccess`, `EnsureClientAccountAccess` and the three routes that pass a scope. Unknown scopes still fall back to the strictest (`active`).
- [x] Backend: barber and client migration defaults reference enum values (`BarberStatusEnum::Pending`, `VenueUniverse::Unisex`, `ClientStatusEnum::Enabled`, `UniverseEnum::Men`).
- [x] Dashboard: `STYLIST_STATUSES` / `STYLIST_STATUS` defined once (`stylist.constant.ts`); the stylist form and entity schemas use `z.enum`, `mapStylist` falls back to `pending` for unknown values, and the form options, defaults and activation toggle stop hardcoding literals.
- [x] Mobile: new `BarberStatus` and `ClientUniverse` enums. `BarberProfileDto.status` (unknown -> pending) and `universe` (unknown -> null), `ClientDto`, `DiscoveryPreferenceDto` and `UniversePreferenceDto.preferredUniverse` (unknown -> null) are typed.
- [x] Tests in every layer.

## Audit findings (no change needed)
- No raw `in:` rules exist in the Barber or Client modules; `StylistRequest`, `UpdateProfileRequest` and the universe requests already use `Rule::enum`.
- Models already cast `status`, `universe`; factories and seeders already use enum cases.
- Booleans already follow `is_` / `has_` (`has_login`, `is_freelancer`, `is_workstation_online`, `is_active`).
- The dashboard has no standalone client entity; client data only appears inside bookings.

## Notes
- Wire values unchanged for `men`/`women`. A stored `preferred_universe` of `all` would no longer cast, but no API or seeder could ever write it (requests accept men/women only; column default is `men`).
- Mobile fixtures that used values the backend never sends (`approved`, `active` for a barber status) now use `enabled`.
- Tests: `tests/Feature/Client/AccountAccessScopeTest.php`, `tests/Feature/Client/Http/Actions/UniversePreferenceEnumTest.php`, dashboard `tests/services/api/dashboard/stylist/stylist.constant.test.ts`, mobile `packages/core/test/client_dto_test.dart`.
- Gates: `migrate:fresh --seed` ok; `pint --test` passed; `composer test` 1326 passed; dashboard lint, 504 tests, build, tsc clean; `melos run verify` exit 0.
