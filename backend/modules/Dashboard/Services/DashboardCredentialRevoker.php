<?php

declare(strict_types=1);

namespace Modules\Dashboard\Services;

use Illuminate\Contracts\Auth\PasswordBrokerFactory;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Repositories\DashboardRefreshTokenResolver;

/**
 * Ends an account's sessions after its password changes: every Sanctum token
 * (dashboard and mobile apps), every dashboard refresh token, and any unused
 * dashboard reset link. `revokeOthers` keeps the session that made the change.
 */
final class DashboardCredentialRevoker
{
    public function __construct(
        private readonly DashboardRefreshTokenResolver $refreshTokens,
        private readonly PasswordBrokerFactory $brokers,
    ) {}

    public function revokeAll(DashboardActorTypeEnum $actorType, AdminModel|BranchModel|BarberModel|ClientModel $account): void
    {
        $this->revokeOthers($actorType, $account, null, null);
    }

    public function revokeOthers(
        DashboardActorTypeEnum $actorType,
        AdminModel|BranchModel|BarberModel|ClientModel $account,
        int|string|null $keepAccessTokenId,
        ?string $keepRefreshToken,
    ): void {
        $account->tokens()
            ->when($keepAccessTokenId !== null, fn ($query) => $query->whereKeyNot($keepAccessTokenId))
            ->delete();

        $this->refreshTokens->revokeAllFor($actorType, (string) $account->getKey(), $keepRefreshToken);
        $this->brokers->broker($actorType->passwordBroker()->value)->deleteToken($account);
    }
}
