<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

use Modules\Client\Enums\UniverseEnum;

/**
 * The clientele a venue (branch) or barber serves (A5/J5). A unisex venue is
 * listed in both the men and the women universe (EC-12).
 */
enum VenueUniverse: string
{
    case Men = 'men';
    case Women = 'women';
    case Unisex = 'unisex';

    /**
     * The venue universes shown to a client browsing $universe.
     *
     * @return list<string>
     */
    public static function servingClient(UniverseEnum $universe): array
    {
        return [$universe->value, self::Unisex->value];
    }
}
