<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers;

use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\NewAccessToken;
use Modules\Admin\Models\AdminModel;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\TokenAbility;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Repositories\DashboardOwnerActorResolver;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class DashboardLoginHandler
{
    public function __construct(
        private readonly DashboardOwnerActorResolver $ownerActors,
    ) {}

    public function authenticate(DashboardActorTypeEnum $actorType, string $email, string $password): ?DashboardActor
    {
        return match ($actorType) {
            DashboardActorTypeEnum::Admin => $this->authenticateAdmin($email, $password),
            DashboardActorTypeEnum::Branch => $this->authenticateBranch($email, $password),
            DashboardActorTypeEnum::Barber => $this->authenticateBarber($email, $password),
            DashboardActorTypeEnum::Owner => $this->authenticateOwner($email, $password),
            default => null,
        };
    }

    /** Creates the Sanctum access token; the session claim is issued afterwards for exactly this token's id. */
    public function createAccessToken(DashboardActor $actor): NewAccessToken
    {
        $model = $this->resolveModel($actor);

        return $model->createToken(
            'dashboard-session',
            TokenAbility::forDashboard(),
            now()->addSeconds($this->accessTtl()),
        );
    }

    /**
     * F-05e (durable revocation): ends the usability of a superseded access token without deleting its row (D-02).
     * Sanctum rejects a token whose `expires_at` is in the past on every request (`Guard::isValidAccessToken`), straight from the database,
     * so the revocation survives a cache flush. Scoped to the actor's own tokens; never extends an expiry.
     */
    public function expireAccessToken(DashboardActor $actor, string $tokenId): void
    {
        $expired = now()->subSecond();

        $this->resolveModel($actor)->tokens()
            ->whereKey($tokenId)
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', $expired))
            ->update(['expires_at' => $expired]);
    }

    private function authenticateAdmin(string $email, string $password): ?DashboardActor
    {
        $admin = AdminModel::query()->where('email', $email)->first();
        $storedPassword = $admin?->getAttribute('password');
        $adminId = $admin?->getAuthIdentifier();
        if ($admin instanceof AdminModel && $admin->isActive() && is_string($storedPassword) && is_string($adminId) && Hash::check($password, $storedPassword)) {
            return new DashboardActor($adminId, DashboardActorTypeEnum::Admin, 'platform_admin', null);
        }

        return null;
    }

    private function authenticateBranch(string $email, string $password): ?DashboardActor
    {
        $branch = BranchModel::query()->where('email', $email)->first();
        $storedPassword = $branch?->getAttribute('password');
        $branchId = $branch?->getAuthIdentifier();
        if ($branch instanceof BranchModel && is_string($storedPassword) && is_string($branchId) && Hash::check($password, $storedPassword)) {
            if ($branch->isBanned()) {
                throw new AccountBannedException;
            }

            return new DashboardActor($branchId, DashboardActorTypeEnum::Branch, 'branch_manager', $branchId);
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

        return new DashboardActor($barberId, DashboardActorTypeEnum::Barber, 'barber', null);
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
            DashboardActorTypeEnum::Admin => AdminModel::query()->findOrFail($actor->id),
            DashboardActorTypeEnum::Branch => BranchModel::query()->findOrFail($actor->id),
            DashboardActorTypeEnum::Barber => BarberModel::query()->findOrFail($actor->id),
            DashboardActorTypeEnum::Owner => ClientModel::query()->findOrFail($actor->id),
        };
    }

    private function accessTtl(): int
    {
        return app(SettingsService::class)->int(SettingKey::DashboardSessionTtlSeconds);
    }
}
