<?php

declare(strict_types=1);

namespace Modules\Ban\Observers;

use Modules\Ban\Models\BanModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Services\DeviceTokenService;

final class BanObserver
{
    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function created(BanModel $ban): void
    {
        if (! BanModel::query()->active()->whereKey($ban->getKey())->exists()) {
            return;
        }

        $actor = $ban->bannable;

        if ($actor instanceof ClientModel || $actor instanceof BarberModel || $actor instanceof BranchModel) {
            $actor->tokens()->delete();
            $this->deviceTokens->revokeAllForAccount($actor);
        }
    }
}
