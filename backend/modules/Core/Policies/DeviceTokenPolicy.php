<?php

declare(strict_types=1);

namespace Modules\Core\Policies;

use Illuminate\Database\Eloquent\Model;
use Modules\Core\Models\DeviceTokenModel;

/** A device token belongs to the one account it was registered for. */
final class DeviceTokenPolicy
{
    public function revoke(Model $actor, DeviceTokenModel $deviceToken): bool
    {
        return $deviceToken->getAttribute('user_type')?->value === $actor->getMorphClass()
            && (string) $deviceToken->getAttribute('user_id') === (string) $actor->getKey();
    }
}
