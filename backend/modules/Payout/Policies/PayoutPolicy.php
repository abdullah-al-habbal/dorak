<?php

declare(strict_types=1);

namespace Modules\Payout\Policies;

use Modules\Admin\Models\AdminModel;

final class PayoutPolicy
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

    /** Decision D: approval, payment and cancellation are separate abilities so a later role split needs no action change. */
    public function approve(mixed $actor, mixed $model): bool
    {
        return $this->viewAny($actor);
    }

    public function markPaid(mixed $actor, mixed $model): bool
    {
        return $this->viewAny($actor);
    }

    public function cancel(mixed $actor, mixed $model): bool
    {
        return $this->viewAny($actor);
    }
}
