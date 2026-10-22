<?php

declare(strict_types=1);

namespace Modules\Review\Handlers\Shared;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Barber\Models\BarberModel;
use Modules\Review\CQRS\Query\Shared\GetBarberReviewsQuery;
use Modules\Review\Eloquent\Resolvers\Shared\GetBarberReviewsEloquentResolver;

final class GetBarberReviewsHandler
{
    public function __construct(
        private readonly GetBarberReviewsEloquentResolver $resolver,
    ) {}

    public function handle(GetBarberReviewsQuery $payload): LengthAwarePaginator
    {
        BarberModel::findOrFail($payload->barberId);

        return $this->resolver->resolve($payload);
    }
}
