Referenced from [`../AGENTS.md`](../AGENTS.md).

## 6. Feature status

**Built:** splash, onboarding tour + skip sheet, auth entry / login / sign-up /
verify, **password recovery (011–014)**, launch gate + go_router route table,
Home placeholder, session-expired redirect (401 → auth).

**Built:** discovery feed (016) — `DiscoveryBloc` over `Paged<BranchDto>` +
`FeedCache`, universe/filter bar, result cards, Discover tab; guest Book Now
raises `RequireAuthentication`.

**Built:** booking (017a + 017b) — `BookingBloc` list/filter/cancel on the
Bookings tab; `BranchDetailBloc` + `BranchDetailScreen` + `FloorPlanGrid`
(chair/services/time selection, `createBooking`, 409 conflict → message,
success → My Bookings) on `/discover/branch/:branchId`.

**Built:** service history + rebook (018a) — `HistoryBloc` over
`Paged<ServiceHistoryDto>` (start/refresh/load-more/retry + rebook submit →
`rebooked` flag, ack reset); `ProfileScreen` rebuilt into the 018 profile tab:
client-name header card (fallback `profileMemberLabel` when the name is unknown
after a token-login restore), Change Password entry kept, localized Service
History feed with per-entry rebook (Material date + time pickers, per-card
`rebookingId` loader, 409 → `bookingConflictMessage`, success `StatusView` →
My Bookings).

**Built:** face analysis + AI style (018b) — `FaceAnalysisBloc` (start loads
recommendations; scan uploads the photo and polls its backend `analysis_status`
with bounded backoff; terminal failure offers a new scan; `recommended_catalog_item_ids`
resolved by paging the catalog, catalog failure tolerated) + `AvatarBloc`
(upload → `avatarUrl`) over a `PhotoPicker` seam (`ImagePickerPhotoPicker`,
`image_picker` hidden behind it). `ProfileScreen` gained an avatar header
(tap to upload, in-flight loader, fallback initial), a Face Analysis card
(empty / pending / result shape+confidence+photo / error-with-retry) and a
Curated For You section (item name `[localeCode] ?? ['en'] ?? ''`, price
range, style period).

**Built:** stylist profile (019) — `StylistProfileBloc` (parallel detail +
currencies via public `GET /currencies`, currency failure tolerated, retry),
`StylistProfileScreen` (avatar header, stats row mapping `rank`/`compatibility_score`
onto `discoverRankBadge`/`discoverCompatibilityBadge`, services list with
price/currency/duration/at-home), branch-detail barbers → tappable rows,
route `/discover/barber/:barberId`.

**Not built:** profile completion (010), logout UI, per-route guards, deep
links, locale persistence.

`core/{di,theme}` are empty directories.

