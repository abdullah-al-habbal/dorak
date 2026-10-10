<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Branches;

use Illuminate\Support\Facades\Hash;
use Modules\Dashboard\CQRS\Command\StoreBranchCommand;
use Modules\Dashboard\Eloquent\Resolvers\Branches\StoreBranchEloquentResolver;

final class StoreBranchHandler
{
    public function __construct(private readonly StoreBranchEloquentResolver $resolver) {}

    public function handle(StoreBranchCommand $command): mixed
    {
        $attributes = $command->attributes;
        $attributes['password'] = Hash::make($attributes['password']);

        return $this->resolver->resolve($attributes);
    }
}
