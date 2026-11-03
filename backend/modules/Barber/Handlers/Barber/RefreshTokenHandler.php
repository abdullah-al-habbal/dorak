<?php

declare(strict_types=1);

namespace Modules\Barber\Handlers\Barber;

use Modules\Activation\Exceptions\AccountNotActiveException;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Enums\TokenAbility;

final class RefreshTokenHandler
{
    /**
     * Swaps the current token for a fresh one. Returns the new plain-text token.
     */
    public function handle(BarberModel $barber): string
    {
        if ($barber->isBanned()) {
            throw new AccountBannedException;
        }

        if ($barber->getAttribute('status') !== BarberStatusEnum::Enabled) {
            throw new AccountNotActiveException;
        }

        $barber->currentAccessToken()->delete();

        return $barber->createToken('barber-app', TokenAbility::forBarberApp())->plainTextToken;
    }
}
