<?php

declare(strict_types=1);

namespace Modules\Barber\Handlers\Branch;

use Illuminate\Support\Facades\DB;
use Modules\Barber\CQRS\Command\Branch\CreateManagedBarberCommand;
use Modules\Barber\Eloquent\Resolvers\Branch\CreateManagedBarberEloquentResolver;
use Modules\Barber\Models\BarberModel;

final class CreateManagedBarberHandler
{
    public function __construct(private readonly CreateManagedBarberEloquentResolver $resolver) {}

    public function handle(CreateManagedBarberCommand $command): BarberModel
    {
        return DB::transaction(fn (): BarberModel => $this->resolver->resolve($command));
    }
}
