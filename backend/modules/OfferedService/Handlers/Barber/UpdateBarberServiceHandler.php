<?php

declare(strict_types=1);

namespace Modules\OfferedService\Handlers\Barber;

use Modules\OfferedService\CQRS\Command\Barber\UpdateBarberServiceCommand;
use Modules\OfferedService\Eloquent\Resolvers\Barber\UpdateBarberServiceEloquentResolver;
use Modules\OfferedService\Models\OfferedServiceModel;

final readonly class UpdateBarberServiceHandler
{
    public function __construct(private UpdateBarberServiceEloquentResolver $resolver) {}

    public function handle(UpdateBarberServiceCommand $command): OfferedServiceModel
    {
        return $this->resolver->resolve($command);
    }
}
