<?php

declare(strict_types=1);

namespace Modules\Dashboard\Services;

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

/**
 * The one answer to "may this account still hold a dashboard session" (F-01c, S6). An account is live when
 * it still exists, is not banned, and, for an admin, is active or, for a barber, is Enabled (login already
 * denies a barber that is not). A Suspended or Disabled branch keeps its manager session: such a branch stays
 * readable and the write guard blocks its writes (decision A, D8, D9). Owners keep their own rules in
 * `DashboardOwnerActorResolver` (status, verified email, brand) and are only ban-checked here.
 */
final class DashboardActorLiveness
{
    public function isLive(DashboardActorTypeEnum $type, string $id): bool
    {
        return match ($type) {
            DashboardActorTypeEnum::Admin => $this->liveAdmin(AdminModel::query()->find($id)),
            DashboardActorTypeEnum::Branch => $this->liveBranch(BranchModel::query()->find($id)),
            DashboardActorTypeEnum::Barber => $this->liveBarber(BarberModel::query()->find($id)),
            DashboardActorTypeEnum::Owner => $this->liveOwner(ClientModel::query()->find($id)),
        };
    }

    public function liveAdmin(?AdminModel $admin): bool
    {
        return $admin instanceof AdminModel && $admin->isActive();
    }

    public function liveBranch(?BranchModel $branch): bool
    {
        return $branch instanceof BranchModel && ! $branch->isBanned();
    }

    public function liveBarber(?BarberModel $barber): bool
    {
        return $barber instanceof BarberModel && $barber->isEnabled && ! $barber->isBanned();
    }

    public function liveOwner(?ClientModel $client): bool
    {
        return $client instanceof ClientModel && ! $client->isBanned();
    }
}
