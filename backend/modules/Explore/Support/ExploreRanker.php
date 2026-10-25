<?php

declare(strict_types=1);

namespace Modules\Explore\Support;

use BackedEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\ClientFaceProfile\Models\ClientFaceAnalysisResultModel;
use Modules\ClientRecommendation\Models\ClientPreferenceVectorModel;
use Modules\ClientRecommendation\Models\EntityEmbeddingModel;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;
use Modules\ClientRecommendation\Services\ExploreRankingWeightsResolver;
use Modules\ClientRecommendation\ValuesObjects\RecommendationFactorWeightsValueObject;

/**
 * Composite discovery ranking (BE-17, REC-2, Task 46): scores the whole
 * candidate set, then orders and paginates it, so the best match overall is
 * first on page 1 and `rank` is contiguous across pages.
 *
 * score = geographic·w_geo + vector_similarity·α + edge_weight·β + face_match·γ
 *
 * α is dropped and redistributed (`withoutAlpha()`) when the client has no
 * preference vector or the target has no embedding.
 */
final class ExploreRanker
{
    /** Nearest candidates scored per request; keeps the cost bounded. */
    public const int CANDIDATE_CAP = 500;

    public function __construct(private readonly ExploreRankingWeightsResolver $weights) {}

    /**
     * The face shape used for the γ boost: the explicit filter value, else the
     * signed-in client's latest face analysis.
     */
    public function faceShapeFor(?string $explicit, ?string $clientId): ?string
    {
        if ($explicit !== null || $clientId === null) {
            return $explicit;
        }

        $shape = ClientFaceAnalysisResultModel::query()
            ->where('client_id', $clientId)
            ->latest()
            ->value('detected_face_shape');

        return $shape instanceof BackedEnum ? (string) $shape->value : (is_string($shape) ? $shape : null);
    }

    /**
     * Sets `compatibility_score` on every candidate.
     *
     * @template TModel of BranchModel|BarberModel
     *
     * @param  Collection<int, TModel>  $candidates  models carrying a `distance` attribute (km, may be null)
     * @param  'branch'|'barber'  $entityType
     * @return Collection<int, TModel>
     */
    public function score(Collection $candidates, string $entityType, ?string $clientId, ?string $faceShape, float $radius): Collection
    {
        if ($candidates->isEmpty()) {
            return $candidates;
        }

        $ids = $candidates->map(fn (Model $model): string => (string) $model->getKey())->all();
        $base = $this->weights->resolveFor($clientId);
        $clientEmbedding = $clientId === null ? null : ClientPreferenceVectorModel::query()->where('client_id', $clientId)->value('embedding');
        $clientEmbedding = is_array($clientEmbedding) && $clientEmbedding !== [] ? $clientEmbedding : null;

        $edges = $clientId === null ? collect() : RecommendationEdgeModel::query()
            ->where('source_type', 'client')
            ->where('source_id', $clientId)
            ->where('target_type', $entityType)
            ->whereIn('target_id', $ids)
            ->pluck('weight', 'target_id');

        $embeddings = $clientEmbedding === null ? collect() : EntityEmbeddingModel::query()
            ->where('entity_type', $entityType)
            ->whereIn('entity_id', $ids)
            ->pluck('embedding', 'entity_id');

        $faceMatches = $faceShape === null ? [] : $this->faceMatches($entityType, $ids, $faceShape);

        return $candidates->each(function (Model $model) use ($base, $clientEmbedding, $edges, $embeddings, $faceMatches, $radius): void {
            $id = (string) $model->getKey();
            $target = $embeddings->get($id);
            $hasVector = $clientEmbedding !== null && is_array($target) && $target !== [];
            $weights = $hasVector ? $base : $base->withoutAlpha();

            $distance = $model->getAttribute('distance');
            $geographic = $distance === null || $radius <= 0.0 ? 0.0 : 1 / (1 + ((float) $distance) / $radius);

            $model->setAttribute('compatibility_score', $this->combine(
                $weights,
                geographic: $geographic,
                similarity: $hasVector ? $this->cosineSimilarity($clientEmbedding, $target) : 0.0,
                edge: (float) $edges->get($id, 0),
                face: isset($faceMatches[$id]) ? 1.0 : 0.0,
            ));
        });
    }

    /**
     * Orders scored candidates (score desc, then nearest, then id), assigns a
     * global `rank`, and returns the requested page.
     *
     * @template TModel of Model
     *
     * @param  Collection<int, TModel>  $scored
     * @return LengthAwarePaginator<int, TModel>
     */
    public function paginate(Collection $scored, int $perPage, ?int $page = null): LengthAwarePaginator
    {
        $page ??= Paginator::resolveCurrentPage();
        $ordered = $this->order($scored);

        return new LengthAwarePaginator(
            $ordered->forPage($page, $perPage)->values(),
            $ordered->count(),
            $perPage,
            $page,
            ['path' => Paginator::resolveCurrentPath(), 'query' => request()->query()],
        );
    }

    /**
     * @template TModel of Model
     *
     * @param  Collection<int, TModel>  $scored
     * @return Collection<int, TModel>
     */
    public function order(Collection $scored): Collection
    {
        $ordered = $scored->sort(function (Model $a, Model $b): int {
            $byScore = ((float) $b->getAttribute('compatibility_score')) <=> ((float) $a->getAttribute('compatibility_score'));
            if ($byScore !== 0) {
                return $byScore;
            }
            $byDistance = ((float) ($a->getAttribute('distance') ?? INF)) <=> ((float) ($b->getAttribute('distance') ?? INF));

            return $byDistance !== 0 ? $byDistance : strcmp((string) $a->getKey(), (string) $b->getKey());
        })->values();

        $ordered->each(fn (Model $model, int $index) => $model->setAttribute('rank', $index + 1));

        return $ordered;
    }

    private function combine(RecommendationFactorWeightsValueObject $weights, float $geographic, float $similarity, float $edge, float $face): float
    {
        return $geographic * $weights->geographic()
            + $similarity * $weights->alpha()
            + $edge * $weights->beta()
            + $face * $weights->gamma();
    }

    /**
     * @param  list<string>  $ids
     * @return array<string, true>
     */
    private function faceMatches(string $entityType, array $ids, string $faceShape): array
    {
        $matchesServices = fn ($services) => $services
            ->where('active', true)
            ->whereHas('catalogItem', fn ($item) => $item
                ->where('is_active', true)
                ->whereJsonContains('face_shapes', $faceShape));

        $query = $entityType === 'branch'
            ? BranchModel::query()->whereHas('brand', fn ($brand) => $brand->whereHas('services', $matchesServices))
            : BarberModel::query()->whereHas('services', $matchesServices);

        return $query
            ->whereKey($ids)
            ->pluck('id')
            ->mapWithKeys(fn (mixed $id): array => [(string) $id => true])
            ->all();
    }

    /**
     * @param  array<int, float>  $a
     * @param  array<int, float>  $b
     */
    private function cosineSimilarity(array $a, array $b): float
    {
        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        foreach ($a as $i => $value) {
            $dot += $value * ($b[$i] ?? 0.0);
            $normA += $value * $value;
        }

        foreach ($b as $value) {
            $normB += $value * $value;
        }

        $denominator = sqrt($normA) * sqrt($normB);

        return $denominator > 0.0 ? $dot / $denominator : 0.0;
    }
}
