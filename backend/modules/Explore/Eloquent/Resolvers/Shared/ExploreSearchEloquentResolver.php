<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Shared;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Explore\CQRS\Query\Shared\ExploreSearchQuery;

/**
 * Unified discovery (Task 45): shops and freelancers in one list, nearest
 * first, with freelancers that have no base location (found only by `q`)
 * after the located results. Both candidate sets come from the per-type
 * resolvers, so the filters are identical to `explore/branches` and
 * `explore/barbers`.
 */
final class ExploreSearchEloquentResolver
{
    public function __construct(
        private readonly ExploreBranchesEloquentResolver $branches,
        private readonly ExploreBarbersEloquentResolver $barbers,
    ) {}

    /** @return LengthAwarePaginator<int, array{type: string, distance: float|null, entity: BranchModel|BarberModel}> */
    public function resolve(ExploreSearchQuery $query): LengthAwarePaginator
    {
        $hits = $this->hits($query);

        $pageHits = $hits->forPage($query->page, $query->perPage)->values();
        $branches = BranchModel::query()->whereKey($pageHits->where('type', 'branch')->pluck('id')->all())->get()->keyBy('id');
        $barbers = BarberModel::query()->whereKey($pageHits->where('type', 'barber')->pluck('id')->all())->get()->keyBy('id');

        $items = $pageHits->map(function (array $hit) use ($branches, $barbers): ?array {
            $entity = $hit['type'] === 'branch' ? $branches->get($hit['id']) : $barbers->get($hit['id']);
            if ($entity === null) {
                return null;
            }
            $entity->setAttribute('distance', $hit['distance']);

            return ['type' => $hit['type'], 'distance' => $hit['distance'], 'entity' => $entity];
        })->filter()->values();

        return new LengthAwarePaginator($items, $hits->count(), $query->perPage, $query->page);
    }

    /** @return Collection<int, array{type: string, id: string, distance: float|null}> */
    private function hits(ExploreSearchQuery $query): Collection
    {
        $located = collect()
            ->concat($this->rows($this->branches->candidates($query->branches)->get(['id', 'distance']), 'branch'))
            ->concat($this->rows($this->barbers->candidates($query->barbers)->get(['id', 'distance']), 'barber'))
            ->sortBy([['distance', 'asc'], ['type', 'asc'], ['id', 'asc']]);

        $locationless = $this->barbers->locationlessTextMatches($query->barbers);
        $unlocated = $locationless === null
            ? collect()
            : $this->rows($locationless->orderBy('barbers.id')->get(['barbers.id']), 'barber');

        return $located->concat($unlocated)->values();
    }

    /**
     * @param  iterable<BranchModel|BarberModel>  $models
     * @return Collection<int, array{type: string, id: string, distance: float|null}>
     */
    private function rows(iterable $models, string $type): Collection
    {
        return collect($models)->map(fn ($model): array => [
            'type' => $type,
            'id' => (string) $model->getKey(),
            'distance' => $model->getAttribute('distance') === null ? null : (float) $model->getAttribute('distance'),
        ]);
    }
}
