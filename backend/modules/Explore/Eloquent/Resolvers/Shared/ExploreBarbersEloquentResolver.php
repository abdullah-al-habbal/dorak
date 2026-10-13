<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Modules\Barber\Models\BarberModel;
use Modules\ClientRecommendation\Models\ClientPreferenceVectorModel;
use Modules\ClientRecommendation\Models\EntityEmbeddingModel;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;
use Modules\ClientRecommendation\Services\ExploreRankingWeightsResolver;
use Modules\Explore\CQRS\Query\Shared\ExploreBarbersQuery;

final class ExploreBarbersEloquentResolver
{
    public function __construct(
        private readonly ExploreRankingWeightsResolver $weightsResolver,
    ) {}

    public function resolve(ExploreBarbersQuery $payload): LengthAwarePaginator
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

        $subQuery = $this->applyFilters($subQuery, $payload);

        $query = BarberModel::query()->fromSub($subQuery, 'barbers_sub')
            ->where('distance', '<', $payload->radius)
            ->orderBy('distance');

        $paginator = $query->paginate($payload->perPage);

        if ($payload->clientId === null) {
            return $paginator;
        }

        $barberIds = $paginator->pluck('id')->toArray();

        $edgeWeights = RecommendationEdgeModel::where('source_type', 'client')
            ->where('source_id', $payload->clientId)
            ->where('target_type', 'barber')
            ->whereIn('target_id', $barberIds)
            ->pluck('weight', 'target_id');

        $clientEmbedding = ClientPreferenceVectorModel::where('client_id', $payload->clientId)->value('embedding');

        $targetEmbeddings = [];
        if ($clientEmbedding !== null) {
            $targetEmbeddings = EntityEmbeddingModel::where('entity_type', 'barber')
                ->whereIn('entity_id', $barberIds)
                ->pluck('embedding', 'entity_id');
        }

        $faceMatchIds = [];
        if ($payload->faceShapeCompatible !== null) {
            $faceMatchIds = BarberModel::query()
                ->whereIn('id', $barberIds)
                ->whereHas('services', fn ($q) => $q
                    ->where('active', true)
                    ->whereHas('catalogItem', fn ($q) => $q
                        ->where('active', true)
                        ->whereJsonContains('face_shapes', $payload->faceShapeCompatible)
                    )
                )
                ->pluck('id')
                ->toArray();
        }

        $weights = $this->weightsResolver->resolveFor($payload->clientId);

        $scored = $paginator->getCollection()->map(function ($barber) use ($edgeWeights, $faceMatchIds, $payload, $clientEmbedding, $targetEmbeddings, $weights) {
            $geographic = 1 / (1 + $barber->distance / $payload->radius);
            $edgeBoost = (float) $edgeWeights->get($barber->id, 0);

            $vectorSimilarity = 0.0;
            if ($clientEmbedding !== null && isset($targetEmbeddings[$barber->id])) {
                $vectorSimilarity = $this->cosineSimilarity($clientEmbedding, $targetEmbeddings[$barber->id]);
            }

            $faceMatch = in_array($barber->id, $faceMatchIds) ? 1 : 0;

            $barber->compatibility_score = $geographic * $weights->geographic()
                + $vectorSimilarity * $weights->alpha()
                + $edgeBoost * $weights->beta()
                + $faceMatch * $weights->gamma();

            return $barber;
        });

        $scored = $scored->sortByDesc('compatibility_score')->values();
        $scored->each(fn ($barber, $i) => $barber->rank = $i + 1);
        $paginator->setCollection($scored);

        return $paginator;
    }

    /**
     * @param  Builder<BarberModel>  $query
     * @return Builder<BarberModel>
     */
    private function applyFilters(Builder $query, ExploreBarbersQuery $payload): Builder
    {
        if ($payload->catalogItemIds !== null) {
            $query->whereHas('services', fn ($q) => $q
                ->where('active', true)
                ->whereIn('catalog_item_id', $payload->catalogItemIds)
                ->whereHas('catalogItem', fn ($catalog) => $catalog->where('active', true))
            );
        }

        if ($payload->availableNow !== null && $payload->availableNow) {
            $query->whereDoesntHave('bookings', fn ($b) => $b->where('status', 'confirmed')
                ->where('time_slot', '<=', now())
                ->where('time_slot', '>', now()->subHour())
            );
        }

        if ($payload->priceRangeMin !== null || $payload->priceRangeMax !== null) {
            $query->whereHas('services', fn ($q) => $q
                ->where('active', true)
                ->whereHas('catalogItem', fn ($catalog) => $catalog->where('active', true))
                ->when($payload->priceRangeMin !== null, fn ($q) => $q->where('price', '>=', $payload->priceRangeMin))
                ->when($payload->priceRangeMax !== null, fn ($q) => $q->where('price', '<=', $payload->priceRangeMax))
            );
        }

        if ($payload->ratingMin !== null) {
            $query->whereHas('reviews', fn ($q) => $q->select(DB::raw('avg(rating)'))
                ->groupBy('subject_id')
                ->having(DB::raw('avg(rating)'), '>=', $payload->ratingMin)
            );
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

    private function cosineSimilarity(array $a, array $b): float
    {
        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;
        foreach ($a as $i => $val) {
            $dot += $val * ($b[$i] ?? 0.0);
            $normA += $val * $val;
        }
        foreach ($b as $val) {
            $normB += $val * $val;
        }
        $denom = sqrt($normA) * sqrt($normB);

        return $denom > 0.0 ? $dot / $denom : 0.0;
    }
}
