<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Branches;

use Illuminate\Support\Facades\Hash;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Dashboard\CQRS\Command\StoreBranchCommand;
use Modules\Dashboard\Eloquent\Resolvers\Branches\StoreBranchEloquentResolver;

final class StoreBranchHandler
{
    public function __construct(private readonly StoreBranchEloquentResolver $resolver) {}

    public function handle(StoreBranchCommand $command): mixed
    {
        $attributes = $command->attributes;
        $attributes['password'] = Hash::make($attributes['password']);
        // D9: a branch of an approved brand starts switched off until its owner switches it on.
        $attributes['status'] = BrandModel::query()->find($attributes['brand_id'])?->isActive() === true ? BranchStatusEnum::Disabled : BranchStatusEnum::Pending;

        return $this->resolver->resolve($attributes);
    }
}
