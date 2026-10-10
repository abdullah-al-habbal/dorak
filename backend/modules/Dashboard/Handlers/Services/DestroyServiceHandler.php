<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Services;

use Modules\Dashboard\CQRS\Command\DestroyServiceCommand;
use Modules\Dashboard\Eloquent\Resolvers\Services\DestroyServiceEloquentResolver;
use Modules\OfferedService\Models\OfferedServiceModel;

final readonly class DestroyServiceHandler
{
    public function __construct(private DestroyServiceEloquentResolver $resolver) {}

    public function handle(OfferedServiceModel $service, DestroyServiceCommand $command): void
    {
        $this->resolver->resolve($service);
    }
}
