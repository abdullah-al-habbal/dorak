<?php

declare(strict_types=1);

namespace Modules\Subscription\Policies;

use Modules\Admin\Models\AdminModel;

/** Plans and brand subscriptions are platform-admin only (Task 65). */
final class SubscriptionAdminPolicy
{
    public function viewAny(mixed $actor): bool
    {
        return $actor instanceof AdminModel;
    }

    public function view(mixed $actor, mixed $model): bool
    {
        return $this->viewAny($actor);
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
