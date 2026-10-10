<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Chairs;

use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\CQRS\Command\DestroyChairCommand;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairConflictResolver;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\DestroyChairEloquentResolver;

final readonly class DestroyChairHandler
{
    public function __construct(
        private ChairConflictResolver $conflictResolver,
        private DestroyChairEloquentResolver $resolver,
    ) {}

    public function handle(ChairModel $chair, DestroyChairCommand $command): void
    {
        $this->conflictResolver->ensureNoBlockingBookings($chair->id);
        $this->resolver->resolve($chair);
    }
}
