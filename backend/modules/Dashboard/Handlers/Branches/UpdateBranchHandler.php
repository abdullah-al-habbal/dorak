<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Branches;

use Illuminate\Support\Facades\Hash;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\CQRS\Command\UpdateBranchCommand;
use Modules\Dashboard\Eloquent\Resolvers\Branches\UpdateBranchEloquentResolver;

final class UpdateBranchHandler
{
    public function __construct(private readonly UpdateBranchEloquentResolver $resolver) {}

    public function handle(BranchModel $branch, UpdateBranchCommand $command): mixed
    {
        $attributes = $command->attributes;
        if (isset($attributes['password'])) {
            $attributes['password'] = Hash::make($attributes['password']);
        }

        return $this->resolver->resolve($branch, $attributes);
    }
}
