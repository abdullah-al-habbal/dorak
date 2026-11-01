# Batch G: Catalog, Subscription and Payment cross-layer enums

Status: [x] Done (single commit)

## Tasks
- [x] Backend: new `Payment\Enums\PaymentGatewayDriver` (`offline`). `PaymentGatewayModel` casts `driver`, `SavePaymentGatewayRequest` uses `Rule::enum`, the command carries the enum, the resource emits `->value`, and the factory and seeder use the case. `PaymentGatewayConstants` is deleted.
- [x] Backend: migration defaults reference enum values (`MediaTypeEnum::Image`, `VenueUniverse::Unisex`); wire values unchanged.
- [x] Dashboard: `PAYMENT_GATEWAY_DRIVERS` / `DEFAULT_PAYMENT_GATEWAY_DRIVER` and `DEFAULT_INTERVAL_UNIT` defined once. The gateway schemas use `z.enum`, the gateway form is a driver select (EN+AR labels), and `mapGateway` falls back to `offline` for unknown drivers.
- [x] Mobile: new `FaceShape`, `StylePeriod` and `CatalogMediaType` enums. `CatalogItemDto.faceShapes` (unknown entries dropped), `stylePeriod` (unknown -> null), `CatalogMediumDto.type` (unknown -> image) and `CatalogCategoryDto.universe` (`VenueUniverse`, unknown -> null) are typed.
- [x] Tests in every layer.

## Audit findings (no change needed)
- No raw `in:` rules in ServiceCatalog, Subscription or Payment; subscription status and interval, and the catalog classification fields, already use enums, casts and `Rule::enum`.
- Booleans already follow `is_` / `has_`.
- Mobile has no subscription or payment DTOs (`realtime_subscription` is unrelated), so nothing to type there.
- Dashboard subscription statuses and interval units were already `z.enum` over shared constants.

## Notes
- Behaviour change: `driver` is now a closed set. Only `offline` is implemented, so arbitrary driver strings (previously accepted, e.g. `wallet`) are rejected with 422. A stored row with another driver would fail the enum cast, so check production data before deploying. Add a case when a real integration lands.
- `face_shapes` / `hair_textures` stay JSON arrays validated per element with `Rule::enum`.
- Tests: `tests/Feature/Monetization/CatalogPaymentEnumContractTest.php`, `PaymentGatewayTest.php`, dashboard `monetization.schema.test.ts` and `monetization.mapper.util.test.ts`, mobile `catalog_item_dto_test.dart`.
- Gates: `migrate:fresh --seed` ok; `pint --test` passed; `composer test` 1329 passed; dashboard lint, tsc, 506 tests and build ok; `melos run verify` ok.
