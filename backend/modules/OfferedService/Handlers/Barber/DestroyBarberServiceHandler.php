<?php

declare(strict_types=1);

namespace Modules\OfferedService\Handlers\Barber;

use Modules\OfferedService\CQRS\Command\Barber\DestroyBarberServiceCommand;
use Modules\OfferedService\Eloquent\Resolvers\Barber\DestroyBarberServiceEloquentResolver;

final readonly class DestroyBarberServiceHandler
{
    public function __construct(private DestroyBarberServiceEloquentResolver $resolver) {}

    public function handle(DestroyBarberServiceCommand $command): void
    {
        $this->resolver->resolve($command);
    }
}
