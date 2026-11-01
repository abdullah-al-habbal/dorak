<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Queries\BookingAvailability;
use Modules\Core\Enums\VenueUniverse;
use Modules\Explore\CQRS\Query\Shared\ExploreBarbersQuery;
use Modules\Explore\Support\ExploreRanker;
use Modules\Explore\Support\ExploreTextSearch;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class ExploreBarbersEloquentResolver
{
    public function __construct(
        private readonly ExploreTextSearch $search,
        private readonly ExploreRanker $ranker,
    ) {}

    /**
     * Every barber matching the search inside the radius, nearest first,
     * with a `distance` column (km). Shared with `explore/search` (Task 45).
     *
     * @return Builder<BarberModel>
     */
    public function candidates(ExploreBarbersQuery $payload): Builder
    {
        $haversine = sprintf(
            '(6371 * acos(cos(radians(%f)) * cos(radians(latitude)) * cos(radians(longitude) - radians(%f)) + sin(radians(%f)) * sin(radians(latitude))))',
            $payload->latitude, $payload->longitude, $payload->latitude
        );

        $subQuery = BarberModel::query()->discoverable()
            ->select('barbers.*')
            ->selectRaw("{$haversine} AS distance")
            ->where('is_freelancer', true)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        $this->applyBoundingBox($subQuery, $payload->latitude, $payload->longitude, $payload->radius);

        if ($payload->universe !== null) {
            $subQuery->whereIn('universe', VenueUniverse::servingClient($payload->universe));
        }

        $subQuery = $this->applyFilters($subQuery, $payload);

        return BarberModel::query()->fromSub($subQuery, 'barbers_sub')
            ->where('distance', '<', $payload->radius)
            ->orderBy('distance');

    }

    /**
     * EC-11: freelancers without a base location cannot be placed on the map,
     * so they are found only by a text search, whatever the radius. Returns
     * null when the request has no `q`.
     *
     * @return Builder<BarberModel>|null
     */
    public function locationlessTextMatches(ExploreBarbersQuery $payload): ?Builder
    {
        if ($payload->search === null) {
            return null;
        }

        $query = BarberModel::query()->discoverable()
            ->select('barbers.*')
            ->selectRaw('NULL AS distance')
            ->where('is_freelancer', true)
            ->where(fn (Builder $missing) => $missing->whereNull('latitude')->orWhereNull('longitude'));

        if ($payload->universe !== null) {
            $query->whereIn('universe', VenueUniverse::servingClient($payload->universe));
        }

        return $this->applyFilters($query, $payload);
    }

    public function resolve(ExploreBarbersQuery $payload): LengthAwarePaginator
    {
        $candidates = $this->candidates($payload)->limit(app(SettingsService::class)->int(SettingKey::ExploreCandidateCap))->get();
        $faceShape = $this->ranker->faceShapeFor($payload->faceShapeCompatible, $payload->clientId);

        return $this->ranker->paginate(
            $this->ranker->score($candidates, 'barber', $payload->clientId, $faceShape, $payload->radius),
            $payload->perPage,
        );
    }

    /**
     * @param  Builder<BarberModel>  $query
     * @return Builder<BarberModel>
     */
    private function applyFilters(Builder $query, ExploreBarbersQuery $payload): Builder
    {
        if ($payload->catalogItemIds !== null) {
            $query->whereHas('services', fn ($q) => $q
                ->where('is_active', true)
                ->whereIn('catalog_item_id', $payload->catalogItemIds)
                ->whereHas('catalogItem', fn ($catalog) => $catalog->where('is_active', true))
            );
        }

        if ($payload->availableNow !== null && $payload->availableNow) {
            $startsAt = now();
            $endsAt = $startsAt->copy()->addMinutes(app(SettingsService::class)->int(SettingKey::BookingMinServiceDurationMinutes));
            $query->whereDoesntHave('bookings', function ($bookingQuery) use ($startsAt, $endsAt): void {
                BookingAvailability::apply($bookingQuery, $startsAt, $endsAt);
            });
        }

        if ($payload->priceRangeMin !== null || $payload->priceRangeMax !== null) {
            $query->whereHas('services', fn ($q) => $q
                ->where('is_active', true)
                ->whereHas('catalogItem', fn ($catalog) => $catalog->where('is_active', true))
                ->when($payload->priceRangeMin !== null, fn ($q) => $q->where('price_amount_minor', '>=', $payload->priceRangeMin))
                ->when($payload->priceRangeMax !== null, fn ($q) => $q->where('price_amount_minor', '<=', $payload->priceRangeMax))
            );
        }

        if ($payload->search !== null) {
            $pattern = $this->search->pattern($payload->search);
            $query->where(function (Builder $match) use ($pattern): void {
                $this->search->orMatchTranslatable($match, ['name'], $pattern);
                $match->orWhereHas('services', fn (Builder $services) => $services
                    ->where('is_active', true)
                    ->where(function (Builder $service) use ($pattern): void {
                        $this->search->orMatchTranslatable($service, ['name'], $pattern);
                        $service->orWhereHas('catalogItem', fn (Builder $item) => $item
                            ->where('is_active', true)
                            ->where(function (Builder $catalog) use ($pattern): void {
                                $this->search->orMatchTranslatable($catalog, ['name'], $pattern);
                                $catalog->orWhereExists(fn (QueryBuilder $tags) => $this->search->tagExists($tags, $pattern, null));
                            }));
                    }));
            });
        }

        if ($payload->tagIds !== null) {
            $query->whereHas('services', fn (Builder $services) => $services
                ->where('is_active', true)
                ->whereHas('catalogItem', fn (Builder $item) => $item
                    ->where('is_active', true)
                    ->whereExists(fn (QueryBuilder $tags) => $this->search->tagExists($tags, null, $payload->tagIds))));
        }

        if ($payload->faceShapeCompatible !== null) {
            // An explicit face shape filters (REC-1); the client's own analysis only boosts.
            $query->whereHas('services', fn (Builder $services) => $services
                ->where('is_active', true)
                ->whereHas('catalogItem', fn (Builder $item) => $item
                    ->where('is_active', true)
                    ->whereJsonContains('face_shapes', $payload->faceShapeCompatible)));
        }

        if ($payload->ratingMin !== null) {
            // Stored aggregate of published/resolved reviews (Task 42).
            $query->where('rating_avg', '>=', $payload->ratingMin);
        }

        return $query;
    }

    /** @param Builder<BarberModel> $query */
    private function applyBoundingBox(Builder $query, float $latitude, float $longitude, float $radius): void
    {
        $latitudeDelta = $radius / 111.32;
        $longitudeDelta = $radius / (111.32 * max(cos(deg2rad($latitude)), 0.000001));

        $query->whereBetween('latitude', [max(-90, $latitude - $latitudeDelta), min(90, $latitude + $latitudeDelta)]);

        if ($longitude - $longitudeDelta >= -180 && $longitude + $longitudeDelta <= 180) {
            $query->whereBetween('longitude', [$longitude - $longitudeDelta, $longitude + $longitudeDelta]);
        }
    }
}
