<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Branches;

use Illuminate\Support\Facades\Hash;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\CQRS\Command\UpdateBranchCommand;
use Modules\Dashboard\Eloquent\Resolvers\Branches\UpdateBranchEloquentResolver;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Services\DashboardMobileResetCodeCleaner;

final class UpdateBranchHandler
{
    public function __construct(
        private readonly UpdateBranchEloquentResolver $resolver,
        private readonly DashboardMobileResetCodeCleaner $mobileCodes,
    ) {}

    public function handle(BranchModel $branch, UpdateBranchCommand $command): mixed
    {
        $attributes = $command->attributes;
        if (isset($attributes['password'])) {
            $attributes['password'] = Hash::make($attributes['password']);
            // A pending app reset code predates the new password. Burned first and outside the transaction (BG-28).
            $this->mobileCodes->clear(DashboardActorTypeEnum::Branch, (string) $branch->getKey());
        }

        return $this->resolver->resolve($branch, $attributes);
    }
}
