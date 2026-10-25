<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Booking\Models\BookingModel;
use Modules\Booking\Queries\BookingAvailability;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Enums\VenueUniverse;
use Modules\Explore\CQRS\Query\Shared\ExploreBranchesQuery;
use Modules\Explore\Support\ExploreRanker;
use Modules\Explore\Support\ExploreTextSearch;

final class ExploreBranchesEloquentResolver
{
    public function __construct(
        private readonly ExploreTextSearch $search,
        private readonly ExploreRanker $ranker,
    ) {}

    /**
     * Every branch matching the search inside the radius, nearest first,
     * with a `distance` column (km). Shared with `explore/search` (Task 45).
     *
     * @return Builder<BranchModel>
     */
    public function candidates(ExploreBranchesQuery $payload): Builder
    {
        $haversine = sprintf(
            '(6371 * acos(cos(radians(%f)) * cos(radians(latitude)) * cos(radians(longitude) - radians(%f)) + sin(radians(%f)) * sin(radians(latitude))))',
            $payload->latitude, $payload->longitude, $payload->latitude
        );

        $subQuery = BranchModel::query()->discoverable()
            ->select('branches.*')
            ->selectRaw("{$haversine} AS distance")
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        $this->applyBoundingBox($subQuery, $payload->latitude, $payload->longitude, $payload->radius);

        if ($payload->universe !== null) {
            $subQuery->whereIn('universe', VenueUniverse::servingClient($payload->universe));
        }

        if ($payload->hiddenBrandIds !== []) {
            $subQuery->whereNotIn('brand_id', $payload->hiddenBrandIds);
        }

        $subQuery = $this->applyFilters($subQuery, $payload);

        return BranchModel::query()->fromSub($subQuery, 'branches_sub')
            ->where('distance', '<', $payload->radius)
            ->orderBy('distance');

    }

    public function resolve(ExploreBranchesQuery $payload): LengthAwarePaginator
    {
        $candidates = $this->candidates($payload)->limit(ExploreRanker::CANDIDATE_CAP)->get();
        $faceShape = $this->ranker->faceShapeFor($payload->faceShapeCompatible, $payload->clientId);

        return $this->ranker->paginate(
            $this->ranker->score($candidates, 'branch', $payload->clientId, $faceShape, $payload->radius),
            $payload->perPage,
        );
    }

    /**
     * @param  Builder<BranchModel>  $query
     * @return Builder<BranchModel>
     */
    private function applyFilters(Builder $query, ExploreBranchesQuery $payload): Builder
    {
        if ($payload->catalogItemIds !== null) {
            $this->whereBrandServices($query, fn ($q) => $q
                ->where('active', true)
                ->whereIn('catalog_item_id', $payload->catalogItemIds)
                ->whereHas('catalogItem', fn ($catalog) => $catalog->where('is_active', true))
            );
        }

        if ($payload->availableNow !== null && $payload->availableNow) {
            $startsAt = now();
            $endsAt = $startsAt->copy()->addMinutes(BookingModel::MINIMUM_SERVICE_DURATION_MINUTES);
            $query->whereHas('chairs', function ($q) use ($startsAt, $endsAt): void {
                $q->whereDoesntHave('bookings', function ($bookingQuery) use ($startsAt, $endsAt): void {
                    BookingAvailability::apply($bookingQuery, $startsAt, $endsAt);
                });
            });
        }

        if ($payload->priceRangeMin !== null || $payload->priceRangeMax !== null) {
            $this->whereBrandServices($query, fn ($q) => $q
                ->where('active', true)
                ->whereHas('catalogItem', fn ($catalog) => $catalog->where('is_active', true))
                ->when($payload->priceRangeMin !== null, fn ($q) => $q->where('price', '>=', $payload->priceRangeMin))
                ->when($payload->priceRangeMax !== null, fn ($q) => $q->where('price', '<=', $payload->priceRangeMax))
            );
        }

        if ($payload->search !== null) {
            $pattern = $this->search->pattern($payload->search);
            $query->where(function (Builder $match) use ($pattern): void {
                $this->search->orMatchTranslatable($match, ['name'], $pattern);
                $this->search->orMatchJsonList($match, 'branches.tags', $pattern);
                $match->orWhereHas('brand', fn (Builder $brand) => $brand->where(fn (Builder $names) => $this->search->orMatchTranslatable($names, ['name'], $pattern)));

                $match->orWhereHas('brand', fn (Builder $brand) => $brand->whereHas('services', fn (Builder $services) => $services
                    ->where('active', true)
                    ->where(function (Builder $service) use ($pattern): void {
                        $this->search->orMatchTranslatable($service, ['name'], $pattern);
                        $service->orWhereHas('catalogItem', fn (Builder $item) => $item
                            ->where('is_active', true)
                            ->where(function (Builder $catalog) use ($pattern): void {
                                $this->search->orMatchTranslatable($catalog, ['name'], $pattern);
                                $catalog->orWhereExists(fn (QueryBuilder $tags) => $this->search->tagExists($tags, $pattern, null));
                            }));
                    })));
            });
        }

        if ($payload->tagIds !== null) {
            $this->whereBrandServices($query, fn (Builder $services) => $services
                ->where('active', true)
                ->whereHas('catalogItem', fn (Builder $item) => $item
                    ->where('is_active', true)
                    ->whereExists(fn (QueryBuilder $tags) => $this->search->tagExists($tags, null, $payload->tagIds))));
        }

        if ($payload->faceShapeCompatible !== null) {
            // An explicit face shape filters (REC-1); the client's own analysis only boosts.
            $this->whereBrandServices($query, fn (Builder $services) => $services
                ->where('active', true)
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

    /**
     * D1: a branch never owns services itself — every service filter reaches
     * them through the branch's brand.
     *
     * @param  Builder<BranchModel>  $query
     * @param  callable(Builder<OfferedServiceModel>): Builder<OfferedServiceModel>  $constraint
     */
    private function whereBrandServices(Builder $query, callable $constraint): void
    {
        $query->whereHas('brand', fn (Builder $brand) => $brand->whereHas('services', $constraint));
    }

    /** @param Builder<BranchModel> $query */
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
