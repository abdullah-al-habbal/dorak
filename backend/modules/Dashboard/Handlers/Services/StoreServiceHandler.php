<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Services;

use Modules\Dashboard\CQRS\Command\StoreServiceCommand;
use Modules\Dashboard\Eloquent\Resolvers\Services\StoreServiceEloquentResolver;
use Modules\OfferedService\Models\OfferedServiceModel;

final readonly class StoreServiceHandler
{
    public function __construct(private StoreServiceEloquentResolver $resolver) {}

    public function handle(StoreServiceCommand $command): OfferedServiceModel
    {
        return $this->resolver->resolve($command->attributes);
    }
}
