<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Broadcast;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;

Broadcast::channel('branch.{branchId}', function (AdminModel|BranchModel|BarberModel $user, string $branchId): bool {
    if ($user instanceof AdminModel) {
        return true;
    }
    if ($user instanceof BranchModel) {
        return $user->id === $branchId;
    }

    return $user->chairs()->where('branch_id', $branchId)->exists();
}, ['guards' => ['admin_api', 'branch_api', 'barber']]);

Broadcast::channel('barber.{barberId}', function (AdminModel|BranchModel|BarberModel $user, string $barberId): bool {
    if ($user instanceof AdminModel) {
        return true;
    }
    if ($user instanceof BarberModel) {
        return $user->id === $barberId;
    }

    return $user->barbers()->whereKey($barberId)->exists();
}, ['guards' => ['admin_api', 'branch_api', 'barber']]);
