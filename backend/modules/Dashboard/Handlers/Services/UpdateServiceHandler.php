<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Services;

use Modules\Dashboard\CQRS\Command\UpdateServiceCommand;
use Modules\Dashboard\Eloquent\Resolvers\Services\UpdateServiceEloquentResolver;
use Modules\OfferedService\Models\OfferedServiceModel;

final readonly class UpdateServiceHandler
{
    public function __construct(private UpdateServiceEloquentResolver $resolver) {}

    public function handle(OfferedServiceModel $service, UpdateServiceCommand $command): OfferedServiceModel
    {
        return $this->resolver->resolve($service, $command->attributes);
    }
}
