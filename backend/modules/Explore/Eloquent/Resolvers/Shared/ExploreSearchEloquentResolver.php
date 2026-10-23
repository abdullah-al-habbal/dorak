<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Barber\Models\BarberModel;
use Modules\Explore\CQRS\Query\Shared\ExploreSearchQuery;
use Modules\Explore\Support\ExploreRanker;

/**
 * Unified discovery (Task 45): shops and freelancers in one list. Located
 * candidates of both types are scored with the shared composite ranking
 * (Task 46) and ordered together; freelancers without a base location (found
 * only by `q`) follow the located results. Both candidate sets come from the
 * per-type resolvers, so the filters are identical to `explore/branches` and
 * `explore/barbers`.
 */
final class ExploreSearchEloquentResolver
{
    public function __construct(
        private readonly ExploreBranchesEloquentResolver $branches,
        private readonly ExploreBarbersEloquentResolver $barbers,
        private readonly ExploreRanker $ranker,
    ) {}

    /** @return LengthAwarePaginator<int, array{type: string, distance: float|null, entity: Model}> */
    public function resolve(ExploreSearchQuery $query): LengthAwarePaginator
    {
        $clientId = $query->branches->clientId;
        $faceShape = $this->ranker->faceShapeFor($query->branches->faceShapeCompatible, $clientId);
        $radius = $query->branches->radius;

        $located = $this->ranker->order(collect()
            ->concat($this->ranker->score($this->branches->candidates($query->branches)->limit(ExploreRanker::CANDIDATE_CAP)->get(), 'branch', $clientId, $faceShape, $radius))
            ->concat($this->ranker->score($this->barbers->candidates($query->barbers)->limit(ExploreRanker::CANDIDATE_CAP)->get(), 'barber', $clientId, $faceShape, $radius)));

        $locationless = $this->barbers->locationlessTextMatches($query->barbers);
        $unlocated = $locationless === null
            ? collect()
            : $this->ranker->order($this->ranker->score($locationless->orderBy('barbers.id')->limit(ExploreRanker::CANDIDATE_CAP)->get(), 'barber', $clientId, $faceShape, $radius));

        $all = $located->concat($unlocated)->values();
        $all->each(fn (Model $model, int $index) => $model->setAttribute('rank', $index + 1));

        $items = $all->forPage($query->page, $query->perPage)->values()->map(fn (Model $model): array => [
            'type' => $model instanceof BarberModel ? 'barber' : 'branch',
            'distance' => $model->getAttribute('distance') === null ? null : (float) $model->getAttribute('distance'),
            'entity' => $model,
        ]);

        return new LengthAwarePaginator($items, $all->count(), $query->perPage, $query->page);
    }
}
