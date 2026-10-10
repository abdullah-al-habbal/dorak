<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Stylists;

use Modules\Barber\Models\BarberModel;
use Modules\Dashboard\CQRS\Command\DestroyStylistCommand;
use Modules\Dashboard\Eloquent\Resolvers\Stylists\DestroyStylistEloquentResolver;

final readonly class DestroyStylistHandler
{
    public function __construct(private DestroyStylistEloquentResolver $resolver) {}

    public function handle(BarberModel $stylist, DestroyStylistCommand $command): void
    {
        $this->resolver->resolve($stylist);
    }
}
