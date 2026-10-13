<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Modules\Branch\Models\BranchModel;
use Modules\ClientRecommendation\Models\ClientPreferenceVectorModel;
use Modules\ClientRecommendation\Models\EntityEmbeddingModel;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;
use Modules\ClientRecommendation\Services\ExploreRankingWeightsResolver;
use Modules\Explore\CQRS\Query\Shared\ExploreBranchesQuery;

final class ExploreBranchesEloquentResolver
{
    public function __construct(
        private readonly ExploreRankingWeightsResolver $weightsResolver,
    ) {}

    public function resolve(ExploreBranchesQuery $payload): LengthAwarePaginator
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

        $subQuery->whereHas('brand', fn ($q) => $q->where('universe', $payload->universe));

        $subQuery = $this->applyFilters($subQuery, $payload);

        $query = BranchModel::query()->fromSub($subQuery, 'branches_sub')
            ->where('distance', '<', $payload->radius)
            ->orderBy('distance');

        $paginator = $query->paginate($payload->perPage);

        if ($payload->clientId === null) {
            return $paginator;
        }

        $branchIds = $paginator->pluck('id')->toArray();

        $edgeWeights = RecommendationEdgeModel::where('source_type', 'client')
            ->where('source_id', $payload->clientId)
            ->where('target_type', 'branch')
            ->whereIn('target_id', $branchIds)
            ->pluck('weight', 'target_id');

        $clientEmbedding = ClientPreferenceVectorModel::where('client_id', $payload->clientId)->value('embedding');

        $targetEmbeddings = [];
        if ($clientEmbedding !== null) {
            $targetEmbeddings = EntityEmbeddingModel::where('entity_type', 'branch')
                ->whereIn('entity_id', $branchIds)
                ->pluck('embedding', 'entity_id');
        }

        $faceMatchIds = [];
        if ($payload->faceShapeCompatible !== null) {
            $faceMatchIds = BranchModel::query()
                ->whereIn('id', $branchIds)
                ->whereHas('offeredServices', fn ($q) => $q
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

        $scored = $paginator->getCollection()->map(function ($branch) use ($edgeWeights, $faceMatchIds, $payload, $clientEmbedding, $targetEmbeddings, $weights) {
            $geographic = 1 / (1 + $branch->distance / $payload->radius);
            $edgeBoost = (float) $edgeWeights->get($branch->id, 0);

            $vectorSimilarity = 0.0;
            if ($clientEmbedding !== null && isset($targetEmbeddings[$branch->id])) {
                $vectorSimilarity = $this->cosineSimilarity($clientEmbedding, $targetEmbeddings[$branch->id]);
            }

            $faceMatch = in_array($branch->id, $faceMatchIds) ? 1 : 0;

            $branch->compatibility_score = $geographic * $weights->geographic()
                + $vectorSimilarity * $weights->alpha()
                + $edgeBoost * $weights->beta()
                + $faceMatch * $weights->gamma();

            return $branch;
        });

        $scored = $scored->sortByDesc('compatibility_score')->values();

        $scored->each(fn ($branch, $i) => $branch->rank = $i + 1);

        $paginator->setCollection($scored);

        return $paginator;
    }

    /**
     * @param  Builder<BranchModel>  $query
     * @return Builder<BranchModel>
     */
    private function applyFilters(Builder $query, ExploreBranchesQuery $payload): Builder
    {
        if ($payload->catalogItemIds !== null) {
            $query->whereHas('offeredServices', fn ($q) => $q
                ->where('active', true)
                ->whereIn('catalog_item_id', $payload->catalogItemIds)
                ->whereHas('catalogItem', fn ($catalog) => $catalog->where('active', true))
            );
        }

        if ($payload->availableNow !== null && $payload->availableNow) {
            $query->whereHas('chairs', fn ($q) => $q->whereDoesntHave('bookings', fn ($b) => $b->where('status', 'confirmed')
                ->where('time_slot', '<=', now())
                ->where('time_slot', '>', now()->subHour())
            )
            );
        }

        if ($payload->priceRangeMin !== null || $payload->priceRangeMax !== null) {
            $query->whereHas('offeredServices', fn ($q) => $q
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
