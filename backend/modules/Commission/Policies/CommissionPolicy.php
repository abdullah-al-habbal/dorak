<?php

declare(strict_types=1);

namespace Modules\Commission\Policies;

use Modules\Admin\Models\AdminModel;

final class CommissionPolicy
{
    public function viewAny(mixed $actor): bool
    {
        return $actor instanceof AdminModel;
    }

    public function create(mixed $actor): bool
    {
        return $this->viewAny($actor);
    }

    public function update(mixed $actor, mixed $model): bool
    {
        return $this->viewAny($actor);
    }

    public function delete(mixed $actor, mixed $model): bool
    {
        return $this->viewAny($actor);
    }
}
