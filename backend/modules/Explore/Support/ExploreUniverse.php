<?php

declare(strict_types=1);

namespace Modules\Explore\Support;

use Modules\Client\Enums\UniverseEnum;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\Universe;

/**
 * Which universe a discovery request browses (BE-03, Task 44): the explicit
 * `universe` parameter, else the signed-in client's `preferred_universe`;
 * a guest or a client whose preference is `all` browses every universe (null).
 */
final class ExploreUniverse
{
    public static function resolve(mixed $requested, mixed $user): ?UniverseEnum
    {
        if (is_string($requested) && $requested !== '') {
            return UniverseEnum::from($requested);
        }

        if (! $user instanceof ClientModel) {
            return null;
        }

        $preferred = $user->getAttribute('preferred_universe');

        return $preferred instanceof Universe && $preferred !== Universe::All
            ? UniverseEnum::tryFrom($preferred->value)
            : null;
    }
}
