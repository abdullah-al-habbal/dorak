<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Broadcast;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;

Broadcast::channel('branch.{branchId}', function (AdminModel|BranchModel|BarberModel $user, string $branchId): bool {
    if ($user instanceof AdminModel) {
        return true;
    }
    // A suspended brand or an inactive branch gets no channel, the same rule as its HTTP routes.
    if ($user instanceof BranchModel) {
        return $user->id === $branchId && $user->isOperational();
    }

    return $user->chairs()->where('branch_id', $branchId)->exists()
        && BranchModel::query()->find($branchId)?->isOperational() === true;
}, ['guards' => ['admin_api', 'branch_api', 'barber']]);

Broadcast::channel('barber.{barberId}', function (AdminModel|BranchModel|BarberModel $user, string $barberId): bool {
    if ($user instanceof AdminModel) {
        return true;
    }
    if ($user instanceof BarberModel) {
        return $user->id === $barberId;
    }

    return $user->isOperational() && $user->barbers()->whereKey($barberId)->exists();
}, ['guards' => ['admin_api', 'branch_api', 'barber']]);

Broadcast::channel('client.{clientId}', fn (ClientModel $user, string $clientId): bool => (string) $user->id === $clientId, ['guards' => ['client']]);
