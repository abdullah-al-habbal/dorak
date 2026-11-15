<?php

declare(strict_types=1);

namespace Modules\Ban\Observers;

use Modules\Ban\Models\BanModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;

final class BanObserver
{
    public function created(BanModel $ban): void
    {
        if (! BanModel::query()->active()->whereKey($ban->getKey())->exists()) {
            return;
        }

        $actor = $ban->bannable;

        if ($actor instanceof ClientModel || $actor instanceof BarberModel || $actor instanceof BranchModel) {
            $actor->tokens()->delete();
        }
    }
}
