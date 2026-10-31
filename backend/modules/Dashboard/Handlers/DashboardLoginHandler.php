<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers;

use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;
use Modules\Admin\Models\AdminModel;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Constants\DashboardActorConstants;
use Modules\Dashboard\Repositories\DashboardOwnerActorResolver;
use Modules\Dashboard\Support\DashboardActor;

final class DashboardLoginHandler
{
    public function __construct(
        private readonly DashboardOwnerActorResolver $ownerActors,
    ) {}

    public function authenticate(string $actorType, string $email, string $password): ?DashboardActor
    {
        return match ($actorType) {
            DashboardActorConstants::DASHBOARD_ACTOR_ADMIN => $this->authenticateAdmin($email, $password),
            DashboardActorConstants::DASHBOARD_ACTOR_BRANCH => $this->authenticateBranch($email, $password),
            DashboardActorConstants::DASHBOARD_ACTOR_BARBER => $this->authenticateBarber($email, $password),
            DashboardActorConstants::DASHBOARD_ACTOR_OWNER => $this->authenticateOwner($email, $password),
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
        $storedPassword = $admin?->getAttribute('password');
        $adminId = $admin?->getAuthIdentifier();
        if ($admin instanceof AdminModel && is_string($storedPassword) && is_string($adminId) && Hash::check($password, $storedPassword)) {
            return new DashboardActor($adminId, DashboardActorConstants::DASHBOARD_ACTOR_ADMIN, 'platform_admin', null);
        }

        return null;
    }

    private function authenticateBranch(string $email, string $password): ?DashboardActor
    {
        $branch = BranchModel::query()->where('email', $email)->first();
        $storedPassword = $branch?->getAttribute('password');
        $branchId = $branch?->getAuthIdentifier();
        if ($branch instanceof BranchModel && is_string($storedPassword) && is_string($branchId) && Hash::check($password, $storedPassword)) {
            return new DashboardActor($branchId, DashboardActorConstants::DASHBOARD_ACTOR_BRANCH, 'branch_manager', $branchId);
        }

        return null;
    }

    private function authenticateBarber(string $email, string $password): ?DashboardActor
    {
        $barber = BarberModel::query()
            ->where('email', $email)
            ->where('has_login', true)
            ->first();

        $storedPassword = $barber?->getAttribute('password');
        $barberId = $barber?->getAuthIdentifier();
        if (! $barber instanceof BarberModel || ! is_string($storedPassword) || ! is_string($barberId) || ! Hash::check($password, $storedPassword)) {
            return null;
        }

        if ($barber->isBanned()) {
            throw new AccountBannedException;
        }

        if (! $barber->isEnabled) {
            return null;
        }

        return new DashboardActor($barberId, DashboardActorConstants::DASHBOARD_ACTOR_BARBER, 'barber', null);
    }

    private function authenticateOwner(string $email, string $password): ?DashboardActor
    {
        $client = ClientModel::query()->where('email', $email)->first();
        $storedPassword = $client?->getAttribute('password');
        if (! $client instanceof ClientModel || ! is_string($storedPassword) || ! Hash::check($password, $storedPassword)) {
            return null;
        }

        if ($client->isBanned()) {
            throw new AccountBannedException;
        }

        return $this->ownerActors->forClient($client);
    }

    private function resolveModel(DashboardActor $actor): AdminModel|BranchModel|BarberModel|ClientModel
    {
        return match ($actor->actorType) {
            DashboardActorConstants::DASHBOARD_ACTOR_ADMIN => AdminModel::query()->findOrFail($actor->id),
            DashboardActorConstants::DASHBOARD_ACTOR_BRANCH => BranchModel::query()->findOrFail($actor->id),
            DashboardActorConstants::DASHBOARD_ACTOR_BARBER => BarberModel::query()->findOrFail($actor->id),
            DashboardActorConstants::DASHBOARD_ACTOR_OWNER => ClientModel::query()->findOrFail($actor->id),
            default => throw new InvalidArgumentException(__('dashboard::messages.actor_type_unsupported', ['actor_type' => $actor->actorType])),
        };
    }

    private function accessTtl(): int
    {
        $ttl = config('dashboard.dashboard.claim_ttl_seconds', 28800);

        return is_int($ttl) ? $ttl : 28800;
    }
}
