<?php

declare(strict_types=1);

namespace Modules\Dashboard\Repositories;

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

/**
 * Finds the account a dashboard password reset may act on. The rules match
 * dashboard sign-in (`DashboardLoginHandler`): a barber needs a login and must
 * be enabled and not banned, and a client qualifies only while it resolves to a
 * brand owner. It runs both when a link is requested and when it is used, so an
 * account that lost dashboard access in between cannot use an old link.
 */
final class DashboardPasswordResetAccountResolver
{
    public function __construct(
        private readonly DashboardOwnerActorResolver $ownerActors,
    ) {}

    public function find(DashboardActorTypeEnum $actorType, string $email): AdminModel|BranchModel|BarberModel|ClientModel|null
    {
        return match ($actorType) {
            DashboardActorTypeEnum::Admin => AdminModel::query()->where('email', $email)->whereNull('deactivated_at')->first(),
            DashboardActorTypeEnum::Branch => BranchModel::query()->where('email', $email)->first(),
            DashboardActorTypeEnum::Barber => $this->findBarber($email),
            DashboardActorTypeEnum::Owner => $this->findOwner($email),
        };
    }

    private function findBarber(string $email): ?BarberModel
    {
        $barber = BarberModel::query()
            ->where('email', $email)
            ->where('has_login', true)
            ->whereNotNull('password')
            ->first();

        if (! $barber instanceof BarberModel || $barber->isBanned() || ! $barber->isEnabled) {
            return null;
        }

        return $barber;
    }

    private function findOwner(string $email): ?ClientModel
    {
        $client = ClientModel::query()->where('email', $email)->first();

        if (! $client instanceof ClientModel || $client->isBanned() || $this->ownerActors->forClient($client) === null) {
            return null;
        }

        return $client;
    }
}
