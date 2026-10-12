<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers;

use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\Support\DashboardActor;

final class DashboardLoginHandler
{
    public function authenticate(string $actorType, string $email, string $password): ?DashboardActor
    {
        return match ($actorType) {
            DashboardActor::ADMIN => $this->authenticateAdmin($email, $password),
            DashboardActor::BRANCH => $this->authenticateBranch($email, $password),
            DashboardActor::BARBER => $this->authenticateBarber($email, $password),
            default => null,
        };
    }

    public function createToken(DashboardActor $actor): string
    {
        $model = $this->resolveModel($actor);

        return $model->createToken(
            'dashboard-session',
            ['dashboard'],
            now()->addSeconds($this->accessTtl()),
        )->plainTextToken;
    }

    private function authenticateAdmin(string $email, string $password): ?DashboardActor
    {
        $admin = AdminModel::query()->where('email', $email)->first();
        if ($admin instanceof AdminModel && Hash::check($password, $admin->password)) {
            return new DashboardActor($admin->id, DashboardActor::ADMIN, 'platform_admin', null);
        }

        return null;
    }

    private function authenticateBranch(string $email, string $password): ?DashboardActor
    {
        $branch = BranchModel::query()->where('email', $email)->first();
        if ($branch instanceof BranchModel && Hash::check($password, $branch->password)) {
            return new DashboardActor($branch->id, DashboardActor::BRANCH, 'branch_manager', $branch->id);
        }

        return null;
    }

    private function authenticateBarber(string $email, string $password): ?DashboardActor
    {
        $barber = BarberModel::query()
            ->where('email', $email)
            ->where('has_login', true)
            ->first();

        if (! $barber instanceof BarberModel || ! Hash::check($password, $barber->password)) {
            return null;
        }

        if (! $barber->status->isEnabled()) {
            return null;
        }

        return new DashboardActor($barber->id, DashboardActor::BARBER, 'barber', null);
    }

    private function resolveModel(DashboardActor $actor): AdminModel|BranchModel|BarberModel
    {
        return match ($actor->actorType) {
            DashboardActor::ADMIN => AdminModel::query()->findOrFail($actor->id),
            DashboardActor::BRANCH => BranchModel::query()->findOrFail($actor->id),
            DashboardActor::BARBER => BarberModel::query()->findOrFail($actor->id),
            default => throw new InvalidArgumentException(__('dashboard::messages.actor_type_unsupported', ['actor_type' => $actor->actorType])),
        };
    }

    private function accessTtl(): int
    {
        $ttl = config('dashboard.dashboard.claim_ttl_seconds', 28800);

        return is_int($ttl) ? $ttl : 28800;
    }
}
