<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Branches;

use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\CQRS\Command\DestroyBranchCommand;
use Modules\Dashboard\Eloquent\Resolvers\Branches\DestroyBranchEloquentResolver;

final class DestroyBranchHandler
{
    public function __construct(private readonly DestroyBranchEloquentResolver $resolver) {}

    public function handle(BranchModel $branch, DestroyBranchCommand $command): void
    {
        $this->resolver->resolve($branch);
    }
}
